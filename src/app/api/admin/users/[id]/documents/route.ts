import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET — list all KYC documents for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 })
    }

    const { id } = await params

    const documents = await prisma.kycDocument.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Error fetching KYC documents:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST — add a KYC document (admin uploads on behalf of user)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { type, fileName, fileUrl, fileSize, mimeType, expiresAt } = body

    if (!type || !fileName || !fileUrl) {
      return NextResponse.json(
        { error: "Type, nom de fichier et URL sont requis" },
        { status: 400 }
      )
    }

    const document = await prisma.kycDocument.create({
      data: {
        userId: id,
        type,
        fileName,
        fileUrl,
        fileSize: fileSize || null,
        mimeType: mimeType || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "KYC_DOCUMENT_ADDED",
        targetType: "KycDocument",
        targetId: document.id,
        metadata: { documentType: type, fileName, forUserId: id },
      },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error("Error creating KYC document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PATCH — update document status (approve/reject)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 })
    }

    const { id: userId } = await params
    const body = await request.json()
    const { documentId, status, rejectionReason } = body

    if (!documentId || !status) {
      return NextResponse.json(
        { error: "documentId et status sont requis" },
        { status: 400 }
      )
    }

    if (!["PENDING", "APPROVED", "REJECTED", "EXPIRED"].includes(status)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 400 })
    }

    // Verify document belongs to user
    const existing = await prisma.kycDocument.findFirst({
      where: { id: documentId, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Document non trouve" }, { status: 404 })
    }

    const document = await prisma.kycDocument.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === "REJECTED" ? rejectionReason || null : null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: `KYC_DOCUMENT_${status}`,
        targetType: "KycDocument",
        targetId: documentId,
        metadata: {
          documentType: document.type,
          previousStatus: existing.status,
          newStatus: status,
          rejectionReason: rejectionReason || null,
          forUserId: userId,
        },
      },
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error("Error updating KYC document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE — remove a KYC document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorise" }, { status: 403 })
    }

    const { id: userId } = await params
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get("documentId")

    if (!documentId) {
      return NextResponse.json({ error: "documentId requis" }, { status: 400 })
    }

    const existing = await prisma.kycDocument.findFirst({
      where: { id: documentId, userId },
    })

    if (!existing) {
      return NextResponse.json({ error: "Document non trouve" }, { status: 404 })
    }

    await prisma.kycDocument.delete({ where: { id: documentId } })

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "KYC_DOCUMENT_DELETED",
        targetType: "KycDocument",
        targetId: documentId,
        metadata: {
          documentType: existing.type,
          fileName: existing.fileName,
          forUserId: userId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting KYC document:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
