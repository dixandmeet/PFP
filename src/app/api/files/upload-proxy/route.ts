// API: File upload proxy — Vercel Blob (prioritaire) › S3 › local dev
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
const USE_LOCAL = !USE_VERCEL_BLOB && !USE_S3

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

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const fileType = formData.get("fileType") as string || "POST_MEDIA"
    const isPublic = formData.get("isPublic") === "true"

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    const isVideo = file.type.startsWith("video/")
    const maxSizeMB = isVideo ? 100 : 10
    if (file.size > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Le fichier dépasse la limite de ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    const key = generateFileKey(user.id, file.name)
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let fileUrl: string

    if (USE_VERCEL_BLOB) {
      // ✅ Vercel Blob — stockage cloud intégré Vercel
      const { put } = await import("@vercel/blob")
      const blob = await put(key, buffer, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      })
      fileUrl = blob.url
    } else if (USE_S3 && s3Client) {
      // ✅ S3 / Cloudflare R2
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: buffer,
          ContentType: file.type,
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
      // 🛠 Local uniquement (développement)
      const uploadDir = path.join(process.cwd(), "public", "uploads", user.id)
      await mkdir(uploadDir, { recursive: true })
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      await writeFile(path.join(uploadDir, filename), buffer)
      fileUrl = `/uploads/${user.id}/${filename}`
    }

    const fileAsset = await prisma.fileAsset.create({
      data: {
        key,
        url: fileUrl,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
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
