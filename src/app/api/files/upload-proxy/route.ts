// API: File upload proxy (avec fallback stockage local si S3 indisponible)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateFileKey, getPublicUrl } from "@/lib/s3"
import { prisma } from "@/lib/prisma"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const USE_LOCAL_STORAGE = process.env.USE_LOCAL_STORAGE === "true" || !process.env.S3_ENDPOINT

const s3Client = !USE_LOCAL_STORAGE ? new S3Client({
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
      return NextResponse.json(
        { error: "Aucun fichier fourni" },
        { status: 400 }
      )
    }

    const isVideo = file.type.startsWith("video/")
    const maxSizeMB = isVideo ? 100 : 10
    const maxSize = maxSizeMB * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `Le fichier dépasse la limite de ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Générer la clé du fichier
    const key = generateFileKey(user.id, file.name)

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    let fileUrl: string

    if (USE_LOCAL_STORAGE || !s3Client) {
      // Stockage local (pour le développement)
      const uploadDir = path.join(process.cwd(), "public", "uploads", user.id)
      await mkdir(uploadDir, { recursive: true })
      
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      const filePath = path.join(uploadDir, filename)
      
      await writeFile(filePath, buffer)
      fileUrl = `/uploads/${user.id}/${filename}`
    } else {
      // Upload vers S3
      const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })

      try {
        await s3Client.send(command)
        fileUrl = getPublicUrl(key)
      } catch (s3Error: any) {
        console.error("Erreur S3:", s3Error)
        return NextResponse.json(
          { error: `Erreur de stockage: ${s3Error.message || "Service indisponible"}` },
          { status: 503 }
        )
      }
    }

    // Créer l'entrée FileAsset
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
