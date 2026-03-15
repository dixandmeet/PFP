// API: Direct file upload (sans S3, pour dev local)
import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/permissions/rbac"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(request: Request) {
  try {
    // Vérifier l'authentification
    let user
    try {
      user = await requireAuth()
    } catch (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Parser le FormData
    let formData
    try {
      formData = await request.formData()
    } catch (parseError) {
      console.error("FormData parse error:", parseError)
      return NextResponse.json(
        { error: "Impossible de lire le formulaire" },
        { status: 400 }
      )
    }

    const file = formData.get("file") as File | null
    const fileType = formData.get("fileType") as string

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Aucun fichier fourni ou format invalide" },
        { status: 400 }
      )
    }

    // Vérifier la taille du fichier (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Le fichier est trop volumineux (max 10MB)" },
        { status: 400 }
      )
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif",
      "application/pdf",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Utilisez JPG, PNG, WebP, GIF ou PDF" },
        { status: 400 }
      )
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = path.join(process.cwd(), "public", "uploads", user.id)
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (mkdirError) {
      console.error("Mkdir error:", mkdirError)
      return NextResponse.json(
        { error: "Impossible de créer le dossier de destination" },
        { status: 500 }
      )
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const cleanFilename = `${fileType?.toLowerCase() || 'file'}_${timestamp}.${extension}`
    const filepath = path.join(uploadsDir, cleanFilename)

    // Convertir le fichier en buffer et l'écrire
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)
    } catch (writeError) {
      console.error("Write file error:", writeError)
      return NextResponse.json(
        { error: "Impossible d'enregistrer le fichier" },
        { status: 500 }
      )
    }

    // URL publique
    const publicUrl = `/uploads/${user.id}/${cleanFilename}`

    

    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    })
  } catch (error) {
    console.error("Unexpected upload error:", error)
    return NextResponse.json(
      { error: "Erreur inattendue lors de l'upload" },
      { status: 500 }
    )
  }
}
