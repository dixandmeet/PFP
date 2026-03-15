// DELETE /api/onboarding/club/[id]/kyc/[docId] — Supprimer un document KYC (si DRAFT)
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { deleteFile } from "@/lib/s3"

type RouteContext = { params: Promise<{ id: string; docId: string }> }

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id: clubId, docId } = await context.params

    // Vérifier ownership du club
    const club = await prisma.clubProfile.findUnique({
      where: { id: clubId },
      select: { id: true, userId: true, status: true },
    })

    if (!club) {
      return NextResponse.json({ error: "Club introuvable" }, { status: 404 })
    }

    if (club.userId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Seuls les clubs DRAFT peuvent supprimer des docs
    if (club.status !== "DRAFT") {
      return NextResponse.json(
        { error: "Les documents ne peuvent pas être supprimés après soumission" },
        { status: 400 }
      )
    }

    // Vérifier que le document existe et appartient au club
    const doc = await prisma.clubKycDocument.findFirst({
      where: { id: docId, clubId },
    })

    if (!doc) {
      return NextResponse.json({ error: "Document introuvable" }, { status: 404 })
    }

    // Supprimer le fichier S3 (best effort)
    try {
      // Extraire la clé S3 de l'URL
      const url = new URL(doc.url)
      const key = url.pathname.replace(/^\/[^/]+\//, "") // Retirer le bucket du path
      await deleteFile(key)
    } catch (s3Error) {
      console.error("[API] Failed to delete S3 file:", s3Error)
      // Continuer même si la suppression S3 échoue
    }

    // Supprimer en DB
    await prisma.clubKycDocument.delete({
      where: { id: docId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] onboarding/club/[id]/kyc/[docId] DELETE error:", error)
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
