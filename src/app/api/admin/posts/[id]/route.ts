import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// DELETE - Delete a post (admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { id } = await params

    const post = await prisma.post.findUnique({ where: { id } })

    if (!post) {
      return NextResponse.json({ error: "Post non trouvé" }, { status: 404 })
    }

    await prisma.post.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "ADMIN_DELETE_POST",
        targetType: "POST",
        targetId: id,
        metadata: { deletedPostUserId: post.userId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du post" },
      { status: 500 }
    )
  }
}
