// S3 / MinIO configuration
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // Nécessaire pour MinIO
})

const BUCKET = process.env.S3_BUCKET || "profoot-files"

export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })

  // URL valide pendant 15 minutes
  return await getSignedUrl(s3Client, command, { expiresIn: 900 })
}

export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  // URL valide pendant 1 heure
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 })
}

export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  await s3Client.send(command)
}

export function getPublicUrl(key: string): string {
  // Pour MinIO/S3 public
  return `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`
}

export function generateFileKey(userId: string, filename: string): string {
  const timestamp = Date.now()
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_")
  return `${userId}/${timestamp}-${cleanFilename}`
}
