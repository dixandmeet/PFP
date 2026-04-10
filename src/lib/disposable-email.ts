import disposableDomains from "disposable-email-domains"

const DOMAIN_SET = new Set(
  (disposableDomains as string[]).map((d) => d.toLowerCase())
)

export function isDisposableEmailDomain(email: string): boolean {
  const at = email.lastIndexOf("@")
  if (at < 0) return false
  const domain = email.slice(at + 1).toLowerCase().trim()
  if (!domain) return false
  return DOMAIN_SET.has(domain)
}
