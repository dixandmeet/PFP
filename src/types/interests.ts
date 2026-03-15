export type InterestType = "favorite" | "interest" | "contact_request"

export type InterestSourceType = "club" | "agent"

export interface InterestItem {
  id: string
  sourceType: InterestSourceType
  sourceId: string
  name: string
  avatarUrl?: string
  type: InterestType
  createdAt: Date
  isRead: boolean
  threadId?: string
}

export interface ProfileStats {
  viewsThisMonth: number
  opportunitiesCount: number
  receivedInterestsCount: number
}

export type NotificationEventType =
  | "favorite_added"
  | "interest_received"
  | "contact_request"

export interface AppNotification {
  id: string
  eventType: NotificationEventType
  title: string
  message: string
  relatedEntityId?: string
  createdAt: Date
  isRead: boolean
}

export interface EmailFallbackPayload {
  recipientEmail: string
  recipientName: string
  eventType: NotificationEventType
  subject: string
  body: string
  relatedEntityId?: string
  triggeredAt: Date
}
