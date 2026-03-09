// Middleware pour protection des routes par rôle (RBAC)
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  })

  const { pathname } = request.nextUrl

  // Routes publiques (pas besoin d'authentification)
  const publicRoutes = [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/terms",
    "/privacy",
    "/support",
    "/about",
    "/contact",
    "/pricing",
    "/careers",
    "/press",
    "/guide",
    "/faq",
    "/blog",
    "/api-docs",
    "/legal",
    "/cgv",
    "/cookies"
  ]
  
  // Routes qui nécessitent une authentification mais pas de vérification de rôle
  const authOnlyRoutes = [
    "/welcome",
    "/onboarding",
    "/complete-profile",
    "/shared"
  ]
  
  // Vérifier si c'est une route publique
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  // Vérifier si c'est une route auth-only
  const isAuthOnlyRoute = authOnlyRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )
  
  if (isPublicRoute || pathname.startsWith("/api/auth") || pathname.startsWith("/api/webhooks")) {
    return NextResponse.next()
  }

  // Laisser passer les routes API d'onboarding et admin clubs (auth vérifiée dans les handlers)
  if (
    pathname.startsWith("/api/onboarding") ||
    pathname.startsWith("/api/admin/clubs") ||
    pathname.startsWith("/api/users/search") ||
    pathname.startsWith("/api/users/create-creator") ||
    pathname.startsWith("/api/invitations/creator")
  ) {
    // Ces routes vérifient l'auth et les rôles en interne
    // On laisse passer ici pour éviter les conflits de rôle
    if (!token) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }
    return NextResponse.next()
  }

  // Redirection si non authentifié
  if (!token) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Pour les routes auth-only, pas besoin de vérifier le rôle
  if (isAuthOnlyRoute) {
    return NextResponse.next()
  }

  // Helper pour obtenir le dashboard selon le rôle
  const getDashboardPath = (userRole: string) => {
    if (userRole === "ADMIN") return "/admin"
    return `/${userRole.toLowerCase()}/dashboard`
  }

  // Vérification des routes par rôle
  const role = token.role as string

  // Routes Player
  if (pathname.startsWith("/player")) {
    if (role !== "PLAYER") {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url))
    }
  }

  // Routes Agent
  if (pathname.startsWith("/agent")) {
    if (role !== "AGENT") {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url))
    }
  }

  // Routes Club (exclure /clubs qui est une route publique)
  if (pathname.startsWith("/club") && !pathname.startsWith("/clubs")) {
    if (role !== "CLUB") {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url))
    }
  }

  // Routes Admin
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url))
    }
  }

  // Ajouter le pathname dans les headers pour les layouts server-side
  const response = NextResponse.next()
  response.headers.set("x-next-pathname", pathname)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}
