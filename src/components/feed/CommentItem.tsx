"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Trash2, User, Shield, Building2 } from "lucide-react"
import { getRelativeTime } from "@/lib/utils/post-utils"

interface CommentUser {
  id: string
  email: string
  role: string
  playerProfile?: {
    firstName: string
    lastName: string
    profilePicture?: string
  }
  agentProfile?: {
    firstName: string
    lastName: string
    profilePicture?: string
  }
  clubProfile?: {
    clubName: string
    logo?: string
  }
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: CommentUser
}

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  onDelete: (commentId: string) => void
}

export function CommentItem({ comment, currentUserId, onDelete }: CommentItemProps) {
  const [deleting, setDeleting] = useState(false)

  const getUserDisplayName = (user: CommentUser) => {
    if (user.playerProfile) {
      return `${user.playerProfile.firstName} ${user.playerProfile.lastName}`
    }
    if (user.agentProfile) {
      return `${user.agentProfile.firstName} ${user.agentProfile.lastName}`
    }
    if (user.clubProfile) {
      return user.clubProfile.clubName
    }
    return user.email
  }

  const getUserAvatar = (user: CommentUser) => {
    return (
      user.playerProfile?.profilePicture ||
      user.agentProfile?.profilePicture ||
      user.clubProfile?.logo
    )
  }

  const handleDelete = async () => {
    if (deleting) return
    setDeleting(true)
    try {
      await onDelete(comment.id)
    } finally {
      setDeleting(false)
    }
  }

  const isOwner = comment.user.id === currentUserId

  return (
    <div className="flex gap-3 py-3">
      {/* Avatar */}
      <Avatar className="h-8 w-8 border border-stadium-200">
        <AvatarImage src={getUserAvatar(comment.user)} />
        <AvatarFallback className="bg-gradient-to-br from-pitch-500 to-pitch-600 text-white text-xs font-bold">
          {getUserDisplayName(comment.user).charAt(0)}
        </AvatarFallback>
      </Avatar>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="bg-stadium-50 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-sm text-stadium-900">
              {getUserDisplayName(comment.user)}
            </span>
            <Badge
              variant="outline"
              className={`text-xs font-semibold ${
                comment.user.role === "PLAYER"
                  ? "bg-pitch-50 text-pitch-700 border-pitch-200"
                  : comment.user.role === "AGENT"
                  ? "bg-gold-50 text-gold-700 border-gold-200"
                  : "bg-victory-50 text-victory-700 border-victory-200"
              }`}
            >
              {comment.user.role === "PLAYER" && <User className="h-3 w-3 mr-1" />}
              {comment.user.role === "AGENT" && <Shield className="h-3 w-3 mr-1" />}
              {comment.user.role === "CLUB" && <Building2 className="h-3 w-3 mr-1" />}
              {comment.user.role}
            </Badge>
          </div>
          <p className="text-sm text-stadium-800 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>

        <div className="flex items-center gap-3 mt-1 px-2">
          <span className="text-xs text-stadium-500 font-medium">
            {getRelativeTime(comment.createdAt)}
          </span>
        </div>
      </div>

      {/* Menu actions */}
      {isOwner && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-stadium-400 hover:text-stadium-600"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Suppression..." : "Supprimer"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
