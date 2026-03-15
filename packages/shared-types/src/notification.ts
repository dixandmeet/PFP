import type { NotificationType } from "@pfp/shared-constants"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}
