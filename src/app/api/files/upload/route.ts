// API: File upload (presigned URL)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError, parseBody } from "@/lib/utils/api-helpers"
import { generateUploadUrl, generateFileKey } from "@/lib/s3"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const uploadRequestSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  fileType: z.enum(["PROFILE_PICTURE", "VIDEO", "DOCUMENT", "REPORT_ATTACHMENT", "POST_MEDIA"]),
  isPublic: z.boolean().default(false),
})

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    const body = await parseBody(request)
    const validatedData = uploadRequestSchema.parse(body)

    // Générer clé S3
    const key = generateFileKey(user.id, validatedData.filename)

    // Générer URL de upload présignée
    const uploadUrl = await generateUploadUrl(key, validatedData.contentType)

    // Créer entrée FileAsset (avant upload)
    const fileAsset = await prisma.fileAsset.create({
      data: {
        key,
        url: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${key}`,
        filename: validatedData.filename,
        mimeType: validatedData.contentType,
        size: 0, // Sera mis à jour après upload
        type: validatedData.fileType,
        ownerId: user.id,
        ownerType: "USER",
        accessPolicy: {
          public: validatedData.isPublic,
          allowedUsers: validatedData.isPublic ? [] : [user.id],
        },
      }
    })

    return NextResponse.json({
      uploadUrl,
      fileAsset: {
        id: fileAsset.id,
        key: fileAsset.key,
        url: fileAsset.url,
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
}
