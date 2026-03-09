// API: File upload proxy — Vercel Blob (prioritaire) › S3 › local dev
// Supporte 2 modes :
//   1. Raw body : Content-Type = mime du fichier, metadata dans headers X-*
//   2. FormData : Content-Type = multipart/form-data (fallback)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateFileKey, getPublicUrl } from "@/lib/s3"
import { prisma } from "@/lib/prisma"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const USE_VERCEL_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN
const USE_S3 = !USE_VERCEL_BLOB && !!process.env.S3_ENDPOINT

const s3Client = USE_S3 ? new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true,
}) : null

const BUCKET = process.env.S3_BUCKET || "profoot-files"

// Extraire le fichier soit depuis les headers (raw body) soit depuis FormData
async function extractFile(request: Request): Promise<{
  buffer: Buffer
  filename: string
  contentType: string
  fileType: string
  isPublic: boolean
}> {
  const ct = request.headers.get("content-type") || ""

  // Mode 1 : Raw body (headers X-File-Name, X-File-Type)
  if (!ct.includes("multipart/form-data")) {
    const arrayBuffer = await request.arrayBuffer()
    return {
      buffer: Buffer.from(arrayBuffer),
      filename: request.headers.get("x-file-name") || `file-${Date.now()}`,
      contentType: ct || "application/octet-stream",
      fileType: request.headers.get("x-file-type") || "POST_MEDIA",
      isPublic: request.headers.get("x-is-public") === "true",
    }
  }

  // Mode 2 : FormData (fallback)
  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) throw new Error("Aucun fichier fourni")

  const arrayBuffer = await file.arrayBuffer()
  return {
    buffer: Buffer.from(arrayBuffer),
    filename: file.name,
    contentType: file.type,
    fileType: (formData.get("fileType") as string) || "POST_MEDIA",
    isPublic: formData.get("isPublic") === "true",
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const { buffer, filename, contentType, fileType, isPublic } = await extractFile(request)

    const isVideo = contentType.startsWith("video/")
    const maxSizeMB = isVideo ? 100 : 10
    if (buffer.length > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Le fichier dépasse la limite de ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    const key = generateFileKey(user.id, filename)

    let fileUrl: string

    if (USE_VERCEL_BLOB) {
      const { put } = await import("@vercel/blob")
      const blob = await put(key, buffer, {
        access: "public",
        contentType,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      fileUrl = blob.url
    } else if (USE_S3 && s3Client) {
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }))
        fileUrl = getPublicUrl(key)
      } catch (s3Error: any) {
        console.error("Erreur S3:", s3Error)
        return NextResponse.json(
          { error: `Erreur de stockage: ${s3Error.message || "Service indisponible"}` },
          { status: 503 }
        )
      }
    } else {
      // Local uniquement (développement sans Blob/S3)
      const uploadDir = path.join(process.cwd(), "public", "uploads", user.id)
      await mkdir(uploadDir, { recursive: true })
      const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      await writeFile(path.join(uploadDir, safeName), buffer)
      fileUrl = `/uploads/${user.id}/${safeName}`
    }

    const fileAsset = await prisma.fileAsset.create({
      data: {
        key,
        url: fileUrl,
        filename,
        mimeType: contentType,
        size: buffer.length,
        type: fileType as any,
        ownerId: user.id,
        ownerType: "USER",
        accessPolicy: {
          public: isPublic,
          allowedUsers: isPublic ? [] : [user.id],
        },
      }
    })

    return NextResponse.json({
      fileAsset: {
        id: fileAsset.id,
        key: fileAsset.key,
        url: fileAsset.url,
      }
    })
  } catch (error) {
    console.error("Erreur upload proxy:", error)
    return handleApiError(error)
  }
}

export const maxDuration = 120
