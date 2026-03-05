import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List posts with moderation info
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "20")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || "posts" // posts or comments

    if (type === "comments") {
      // Get comments
      const where: any = {}
      
      if (search) {
        where.content = { contains: search, mode: "insensitive" }
      }

      const total = await prisma.comment.count({ where })
      
      const comments = await prisma.comment.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
            },
          },
        },
      })

      return NextResponse.json({
        items: comments,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      })
    }

    // Get posts
    const where: any = {}
    
    if (search) {
      where.content = { contains: search, mode: "insensitive" }
    }

    const total = await prisma.post.count({ where })
    
    const posts = await prisma.post.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            shares: true,
          },
        },
      },
    })

    return NextResponse.json({
      items: posts,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    )
  }
}

// DELETE - Delete post or comment
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") // "post" or "comment"
    const id = searchParams.get("id")

    if (!type || !id) {
      return NextResponse.json(
        { error: "Type et ID requis" },
        { status: 400 }
      )
    }

    if (type === "comment") {
      const comment = await prisma.comment.findUnique({ where: { id } })
      
      if (!comment) {
        return NextResponse.json({ error: "Commentaire non trouvé" }, { status: 404 })
      }

      await prisma.comment.delete({ where: { id } })

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ADMIN_DELETE_COMMENT",
          targetType: "COMMENT",
          targetId: id,
          metadata: { content: comment.content.substring(0, 100) },
        },
      })
    } else if (type === "post") {
      const post = await prisma.post.findUnique({ where: { id } })
      
      if (!post) {
        return NextResponse.json({ error: "Post non trouvé" }, { status: 404 })
      }

      await prisma.post.delete({ where: { id } })

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ADMIN_DELETE_POST",
          targetType: "POST",
          targetId: id,
          metadata: { content: post.content.substring(0, 100) },
        },
      })
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression du contenu" },
      { status: 500 }
    )
  }
}
