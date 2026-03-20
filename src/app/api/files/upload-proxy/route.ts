// API: File upload proxy — Vercel Blob (prioritaire) › S3 › local dev
// Supporte 2 modes :
//   1. Raw body : Content-Type = mime du fichier, metadata dans headers X-*
//   2. FormData : Content-Type = multipart/form-data (fallback)
// Les vidéos non-browser (avi, mkv, wmv, flv…) sont transcodées en MP4 via ffmpeg-static
import { NextResponse } from "next/server"
import { createHash } from "crypto"
import { Role } from "@prisma/client"
import { requireAuth } from "@/lib/permissions/rbac"
import { handleApiError } from "@/lib/utils/api-helpers"
import { generateFileKey, getPublicUrl } from "@/lib/s3"
import { prisma } from "@/lib/prisma"
import {
  assertPlayerVideoStorageAllows,
  recordPlayerVideoStorageBytes,
  StorageQuotaExceededError,
} from "@/lib/gamification/storage-quota"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { writeFile, mkdir, readFile, unlink } from "fs/promises"
import { execFile } from "child_process"
import { promisify } from "util"
import path from "path"
import os from "os"

const execFileAsync = promisify(execFile)

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

// Types valides pour FileAsset (doit correspondre à l'enum Prisma FileAssetType)
const VALID_FILE_TYPES = new Set([
  "PROFILE_PICTURE",
  "COVER_PHOTO",
  "VIDEO",
  "DOCUMENT",
  "REPORT_ATTACHMENT",
  "POST_MEDIA",
])

// Formats vidéo nativement supportés par les navigateurs
const BROWSER_NATIVE_VIDEO_EXTS = new Set([".mp4", ".webm", ".ogg", ".ogv"])

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

/**
 * Transcode une vidéo en MP4 (H.264 + AAC) via ffmpeg-static.
 * Retourne { buffer, filename, contentType } transcodé, ou null si échec/pas nécessaire.
 */
async function transcodeToMp4(
  inputBuffer: Buffer,
  originalFilename: string
): Promise<{ buffer: Buffer; filename: string; contentType: string } | null> {
  const ext = path.extname(originalFilename).toLowerCase()

  // Déjà un format browser-natif → pas besoin de transcoder
  if (BROWSER_NATIVE_VIDEO_EXTS.has(ext)) {
    return null
  }

  let ffmpegPath: string
  try {
    // ffmpeg-static fournit le chemin vers le binaire
    ffmpegPath = require("ffmpeg-static")
    if (!ffmpegPath) throw new Error("ffmpeg-static path is null")
  } catch {
    console.warn("[transcode] ffmpeg-static non disponible, skip transcode")
    return null
  }

  const tmpDir = os.tmpdir()
  const timestamp = Date.now()
  const inputPath = path.join(tmpDir, `pfp-input-${timestamp}${ext}`)
  const outputPath = path.join(tmpDir, `pfp-output-${timestamp}.mp4`)

  try {
    // Écrire le fichier source en temp
    await writeFile(inputPath, inputBuffer)

    // Transcoder : H.264 (baseline pour compatibilité max) + AAC
    // -movflags +faststart : permet la lecture streaming
    // -preset ultrafast : rapide, qualité acceptable
    // -crf 23 : qualité par défaut (bon compromis taille/qualité)
    await execFileAsync(ffmpegPath, [
      "-i", inputPath,
      "-c:v", "libx264",
      "-profile:v", "baseline",
      "-level", "3.1",
      "-pix_fmt", "yuv420p",
      "-c:a", "aac",
      "-b:a", "128k",
      "-movflags", "+faststart",
      "-preset", "ultrafast",
      "-crf", "23",
      "-y",
      outputPath,
    ], { timeout: 120_000 }) // 2 min max

    const transcodedBuffer = await readFile(outputPath)
    const baseName = path.basename(originalFilename, ext)

    console.log(
      `[transcode] ${originalFilename} (${(inputBuffer.length / 1024 / 1024).toFixed(1)}MB) → MP4 (${(transcodedBuffer.length / 1024 / 1024).toFixed(1)}MB)`
    )

    return {
      buffer: transcodedBuffer,
      filename: `${baseName}.mp4`,
      contentType: "video/mp4",
    }
  } catch (error: any) {
    console.error("[transcode] Erreur ffmpeg:", error.message || error)
    return null
  } finally {
    // Nettoyage des fichiers temp
    await unlink(inputPath).catch(() => {})
    await unlink(outputPath).catch(() => {})
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth()

    let { buffer, filename, contentType, fileType, isPublic } = await extractFile(request)

    const isVideo = contentType.startsWith("video/")
    const maxSizeMB = isVideo ? 100 : 10
    if (buffer.length > maxSizeMB * 1024 * 1024) {
      return NextResponse.json(
        { error: `Le fichier dépasse la limite de ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Transcoder les vidéos non-browser en MP4
    if (isVideo) {
      const transcoded = await transcodeToMp4(buffer, filename)
      if (transcoded) {
        buffer = transcoded.buffer
        filename = transcoded.filename
        contentType = transcoded.contentType
      }
    }

    // Valider le type de fichier — fallback sur POST_MEDIA si invalide
    const safeFileType = VALID_FILE_TYPES.has(fileType) ? fileType : "POST_MEDIA"

    if (isVideo && user.role === Role.PLAYER && safeFileType === "VIDEO") {
      await assertPlayerVideoStorageAllows(
        user.id,
        user.role,
        safeFileType,
        buffer.length
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
          { error: "Erreur de stockage. Veuillez réessayer." },
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

    const contentHash =
      isVideo && safeFileType === "VIDEO"
        ? createHash("sha256").update(buffer).digest("hex")
        : null

    const fileAsset = await prisma.fileAsset.create({
      data: {
        key,
        url: fileUrl,
        filename,
        mimeType: contentType,
        size: buffer.length,
        type: safeFileType as any,
        contentHash,
        ownerId: user.id,
        ownerType: "USER",
        accessPolicy: {
          public: isPublic,
          allowedUsers: isPublic ? [] : [user.id],
        },
      }
    })

    if (isVideo && user.role === Role.PLAYER && safeFileType === "VIDEO") {
      await recordPlayerVideoStorageBytes(
        user.id,
        user.role,
        safeFileType,
        buffer.length
      )
    }

    return NextResponse.json({
      fileAsset: {
        id: fileAsset.id,
        key: fileAsset.key,
        url: fileAsset.url,
      }
    })
  } catch (error) {
    console.error("Erreur upload proxy:", error)
    if (error instanceof StorageQuotaExceededError) {
      return NextResponse.json(
        { error: error.message, code: "STORAGE_QUOTA_EXCEEDED" },
        { status: 403 }
      )
    }
    return handleApiError(error)
  }
}

export const maxDuration = 120
