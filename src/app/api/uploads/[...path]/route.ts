// GET /api/uploads/[...path] — Sert les fichiers privés avec authentification
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { readFile } from "fs/promises"
import path from "path"

const MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifie" }, { status: 401 })
    }

    const pathSegments = await params
    const filePath = pathSegments.path

    // Validation: empêcher le path traversal
    if (filePath.some((seg) => seg.includes("..") || seg.includes("~") || seg.includes("\0"))) {
      return NextResponse.json({ error: "Chemin invalide" }, { status: 400 })
    }

    const relativePath = filePath.join("/")

    // Vérifier les droits d'accès selon le type de fichier
    const isStaffKyc = relativePath.startsWith("staff-kyc/")
    const isClubKyc = relativePath.startsWith("clubs/")

    if (isStaffKyc) {
      // staff-kyc/{userId}/... — seul l'utilisateur ou un admin peut accéder
      const fileUserId = filePath[1] // staff-kyc/{userId}/filename
      if (session.user.role !== "ADMIN" && session.user.id !== fileUserId) {
        return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
      }
    } else if (isClubKyc) {
      // clubs/{clubId}/... — seul le propriétaire du club ou un admin peut accéder
      if (session.user.role !== "ADMIN") {
        const { prisma } = await import("@/lib/prisma")
        const clubId = filePath[1] // clubs/{clubId}/filename
        const club = await prisma.clubProfile.findUnique({
          where: { id: clubId },
          select: { userId: true },
        })
        if (!club || club.userId !== session.user.id) {
          return NextResponse.json({ error: "Acces refuse" }, { status: 403 })
        }
      }
    } else {
      return NextResponse.json({ error: "Ressource introuvable" }, { status: 404 })
    }

    // Lire le fichier depuis le dossier privé
    const absolutePath = path.join(process.cwd(), "private-uploads", ...filePath)

    // Vérifier que le chemin résolu reste dans le dossier private-uploads
    const resolvedPath = path.resolve(absolutePath)
    const privateUploadsDir = path.resolve(path.join(process.cwd(), "private-uploads"))
    if (!resolvedPath.startsWith(privateUploadsDir)) {
      return NextResponse.json({ error: "Chemin invalide" }, { status: 400 })
    }

    const fileBuffer = await readFile(resolvedPath)

    const ext = path.extname(resolvedPath).slice(1).toLowerCase()
    const contentType = MIME_TYPES[ext] || "application/octet-stream"

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error: any) {
    if (error?.code === "ENOENT") {
      return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 })
    }
    console.error("[API] uploads GET error:", error)
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 })
  }
}
