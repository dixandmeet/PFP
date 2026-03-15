"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { 
  Loader2, 
  Bell,
  CheckCircle,
  Trash2,
  Eye,
  FileText,
  Users,
  Target,
  Heart,
  MessageSquare,
  UserPlus
} from "lucide-react"
import Link from "next/link"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

const notificationIcons: Record<string, any> = {
  MANDATE_REQUEST: FileText,
  MANDATE_ACCEPTED: CheckCircle,
  MANDATE_REJECTED: Trash2,
  APPLICATION_RECEIVED: FileText,
  SUBMISSION_RECEIVED: Users,
  LISTING_NEW: Target,
  REPORT_SHARED: FileText,
  POST_LIKE: Heart,
  POST_COMMENT: MessageSquare,
  FOLLOW: UserPlus,
  AI_ACTION_COMPLETED: CheckCircle,
  PROFILE_VIEWED: Eye,
}

export default function PlayerNotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState<string | null>(null)

  // Charger les notifications
  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications")
        if (!response.ok) throw new Error("Erreur")

        const data = await response.json()
        setNotifications(data.notifications || [])
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [toast])

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingRead(notificationId)
    try {
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })

      if (!response.ok) throw new Error("Erreur")

      setNotifications(
        notifications.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      )
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de marquer comme lu",
        variant: "destructive",
      })
    } finally {
      setMarkingRead(null)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id)
      
      await Promise.all(
        unreadIds.map((id) =>
          fetch(`/api/notifications/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isRead: true }),
          })
        )
      )

      setNotifications(
        notifications.map((n) => ({ ...n, isRead: true }))
      )

      toast({
        title: "Succès",
        description: "Toutes les notifications marquées comme lues",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du marquage",
        variant: "destructive",
      })
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const readNotifications = notifications.filter((n) => n.isRead)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Toutes lues"}
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune notification</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Non lues */}
          {unreadNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                Non lues
                <Badge variant="outline">{unreadNotifications.length}</Badge>
              </h2>

              <div className="space-y-2">
                {unreadNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell
                  return (
                    <Card
                      key={notification.id}
                      className="border-blue-200 bg-blue-50/50"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3 flex-1">
                            <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                              <CardTitle className="text-base">
                                {notification.title}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {notification.message}
                              </CardDescription>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "long",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex gap-2">
                          {notification.link && (
                            <Link href={notification.link}>
                              <Button size="sm" variant="outline">
                                <Eye className="mr-2 h-4 w-4" />
                                Voir
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markingRead === notification.id}
                          >
                            {markingRead === notification.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marquer comme lu
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lues */}
          {readNotifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3 text-gray-600">
                Lues
              </h2>

              <div className="space-y-2">
                {readNotifications.map((notification) => {
                  const Icon = notificationIcons[notification.type] || Bell
                  return (
                    <Card key={notification.id} className="opacity-60">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <CardTitle className="text-base">
                              {notification.title}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {notification.message}
                            </CardDescription>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(
                                notification.createdAt
                              ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
