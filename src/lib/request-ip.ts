import type { NextRequest } from "next/server"

/**
 * IP client derrière Vercel / reverse proxy (premier hop de X-Forwarded-For).
 */
export function getClientIpFromHeaders(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (forwarded) return forwarded
  const real = headers.get("x-real-ip")?.trim()
  if (real) return real
  return null
}

export function getClientIp(request: NextRequest): string | null {
  return getClientIpFromHeaders(request.headers)
}
