import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { handleApiError } from "@/lib/utils/api-helpers"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id: profileUserId } = await params
    const viewerId = session.user.id

    if (viewerId !== profileUserId) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: profileUserId,
          },
        },
      })
      if (!follow) {
        return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
      }
    }

    const target = await prisma.user.findUnique({
      where: { id: profileUserId },
      select: { role: true },
    })
    if (!target || target.role !== "PLAYER") {
      return NextResponse.json({ error: "Profil joueur introuvable" }, { status: 404 })
    }

    const videos = await prisma.playerFootballVideo.findMany({
      where: {
        userId: profileUserId,
        status: "AWARDED",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        skillCategory: true,
        durationSeconds: true,
        createdAt: true,
        fileAsset: {
          select: { url: true, mimeType: true },
        },
      },
    })

    return NextResponse.json({ videos })
  } catch (e) {
    return handleApiError(e)
  }
}
