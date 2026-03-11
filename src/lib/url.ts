/**
 * Returns the application base URL without trailing slash.
 *
 * Priority: NEXT_PUBLIC_APP_URL > NEXTAUTH_URL > localhost fallback.
 * NEXT_PUBLIC_APP_URL should be your canonical production domain
 * (e.g. https://profootprofile.com) so emails and links always
 * use the right origin, even when NEXTAUTH_URL points to the
 * Vercel auto-generated *.vercel.app URL.
 */
export function getBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"

  return url.replace(/\/+$/, "")
}
