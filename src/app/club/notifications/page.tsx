"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Bell, CheckCircle, FileText, Users, Target, Heart, MessageSquare } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

const icons: Record<string, any> = {
  MANDATE_REQUEST: FileText,
  MANDATE_ACCEPTED: CheckCircle,
  APPLICATION_RECEIVED: FileText,
  SUBMISSION_RECEIVED: Users,
  LISTING_NEW: Target,
  POST_LIKE: Heart,
  POST_COMMENT: MessageSquare,
}

export default function ClubNotificationsPage() {
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/notifications")
        if (!r.ok) throw new Error()
        const d = await r.json()
        setNotifications(d.notifications || [])
      } catch {
        toast({ title: "Erreur", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      })
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    }
  }

  const unread = notifications.filter((n) => !n.isRead)

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-gray-600 mt-1">{unread.length} non lue(s)</p>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Aucune notification</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = icons[n.type] || Bell
            return (
              <Card key={n.id} className={n.isRead ? "opacity-60" : "border-blue-200 bg-blue-50/50"}>
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="flex-1">
                      <CardTitle className="text-base">{n.title}</CardTitle>
                      <CardDescription>{n.message}</CardDescription>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                {!n.isRead && (
                  <CardContent className="pt-0">
                    <Button size="sm" variant="ghost" onClick={() => markAsRead(n.id)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Lu
                    </Button>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
