import type { InterestItem, ProfileStats, AppNotification } from "@/types/interests"

export const mockInterests: InterestItem[] = [
  {
    id: "int-1",
    sourceType: "club",
    sourceId: "club-abc",
    name: "FC Nantes",
    avatarUrl: undefined,
    type: "favorite",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: "int-2",
    sourceType: "agent",
    sourceId: "agent-xyz",
    name: "Pierre Durand",
    avatarUrl: undefined,
    type: "interest",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: "int-3",
    sourceType: "club",
    sourceId: "club-def",
    name: "OGC Nice",
    avatarUrl: undefined,
    type: "contact_request",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isRead: true,
    threadId: "thread-001",
  },
]

export const mockProfileStats: ProfileStats = {
  viewsThisMonth: 3,
  opportunitiesCount: 1,
  receivedInterestsCount: 3,
}

export const mockNotifications: AppNotification[] = [
  {
    id: "notif-1",
    eventType: "favorite_added",
    title: "Ajouté en favori",
    message: "FC Nantes t'a ajouté en favori",
    relatedEntityId: "club-abc",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: "notif-2",
    eventType: "interest_received",
    title: "Intérêt reçu",
    message: "Pierre Durand a manifesté un intérêt",
    relatedEntityId: "agent-xyz",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: false,
  },
  {
    id: "notif-3",
    eventType: "contact_request",
    title: "Demande de contact",
    message: "OGC Nice souhaite te contacter",
    relatedEntityId: "club-def",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isRead: true,
  },
]
