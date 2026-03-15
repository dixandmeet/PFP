import type { EmailFallbackPayload, NotificationEventType } from "@/types/interests"

const FALLBACK_ELIGIBLE_EVENTS: NotificationEventType[] = [
  "interest_received",
  "contact_request",
]

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export function shouldSendEmailFallback(
  lastSeenAt: Date,
  eventType: NotificationEventType
): boolean {
  if (!FALLBACK_ELIGIBLE_EVENTS.includes(eventType)) return false
  const elapsed = Date.now() - lastSeenAt.getTime()
  return elapsed > TWENTY_FOUR_HOURS_MS
}

export function queueEmailFallback(payload: EmailFallbackPayload): void {
  if (process.env.NODE_ENV === "development") {
    console.log("EMAIL_FALLBACK_QUEUED")
  }
}
