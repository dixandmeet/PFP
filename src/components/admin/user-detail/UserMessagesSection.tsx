"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Users, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import type { ConversationEntry } from "./types"

interface UserMessagesSectionProps {
  conversations: ConversationEntry[]
  currentUserId: string
  messageCount: number
}

export function UserMessagesSection({
  conversations,
  currentUserId,
  messageCount,
}: UserMessagesSectionProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-slate-500" />
        <h3 className="text-lg font-semibold text-slate-900">
          Conversations ({conversations.length})
        </h3>
        <Badge variant="secondary" className="text-xs">
          {messageCount} messages envoyes
        </Badge>
      </div>

      {/* Conversations list */}
      {conversations.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">Aucune conversation</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            const { conversation } = conv
            const otherParticipants = conversation.participants.filter(
              (p) => p.user.id !== currentUserId
            )
            const lastMessage = conversation.messages[0]

            return (
              <Card
                key={conversation.id}
                className="p-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Avatars */}
                  <div className="flex -space-x-2 shrink-0">
                    {otherParticipants.slice(0, 3).map((p) => (
                      <Avatar key={p.user.id} className="h-9 w-9 border-2 border-white">
                        <AvatarImage src={p.user.image || ""} />
                        <AvatarFallback className="text-xs bg-slate-100">
                          {(p.user.name || p.user.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {otherParticipants.length > 3 && (
                      <div className="h-9 w-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                        <span className="text-xs text-slate-500">
                          +{otherParticipants.length - 3}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {otherParticipants.map((p) => p.user.name || p.user.email).join(", ")}
                      </p>
                      <Badge variant="outline" className="text-xs shrink-0">
                        <Users className="h-3 w-3 mr-1" />
                        {conversation.participants.length}
                      </Badge>
                    </div>

                    {lastMessage ? (
                      <p className="text-xs text-slate-500 truncate">
                        <span className="font-medium">{lastMessage.sender.name || "Inconnu"}: </span>
                        {lastMessage.content || "(piece jointe)"}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 italic">Aucun message</p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {conversation._count.messages} messages
                      </span>
                      {conversation.lastMessageAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(conversation.lastMessageAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
