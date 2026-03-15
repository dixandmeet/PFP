import { prisma } from "@/lib/prisma"
import { sendEmail, emailTemplates } from "@/lib/email"
import { getBaseUrl } from "@/lib/url"
import type { NotificationType } from "@prisma/client"

interface NotifyAdminsOptions {
  type: NotificationType
  title: string
  message: string
  link?: string
}

/**
 * Notifie tous les admins (notification in-app + email).
 * Appel fire-and-forget : ne bloque pas la route appelante.
 */
export async function notifyAdmins({ type, title, message, link }: NotifyAdminsOptions) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: { id: true, email: true, name: true },
    })

    if (admins.length === 0) return

    // Notifications in-app
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type,
        title,
        message,
        link: link ?? null,
      })),
    })

    // Emails
    const baseUrl = getBaseUrl()
    const ctaUrl = link ? `${baseUrl}${link}` : baseUrl
    for (const admin of admins) {
      const adminName = admin.name || admin.email.split("@")[0]
      const { subject, html } = emailTemplates.notificationEmail(
        adminName,
        title,
        message,
        ctaUrl,
        "Voir dans l'admin"
      )
      sendEmail({ to: admin.email, subject, html }).catch((err) =>
        console.error("[notifyAdmins] Email error:", err)
      )
    }
  } catch (error) {
    console.error("[notifyAdmins] Error:", error)
  }
}
