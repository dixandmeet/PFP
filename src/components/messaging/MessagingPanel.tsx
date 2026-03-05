"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Send,
  Paperclip,
  FileText,
  X,
  ArrowLeft,
  Image as ImageIcon,
  File,
  Film,
  Music,
  ClipboardList,
  Loader2,
  Check,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Participant {
  id: string
  userId: string
  lastReadAt: string | null
  user: {
    id: string
    name: string | null
    image: string | null
    role: string
    playerProfile?: { firstName: string; lastName: string; profilePicture: string | null } | null
    agentProfile?: { firstName: string; lastName: string; profilePicture: string | null } | null
    clubProfile?: { clubName: string; logo: string | null } | null
  }
}

interface Attachment {
  id: string
  type: "FILE" | "REPORT"
  fileUrl: string | null
  fileName: string | null
  fileSize: number | null
  mimeType: string | null
  report: {
    id: string
    title: string
    shareSlug: string | null
    status: string
    authorType: string
    subject: { firstName: string; lastName: string }
    createdAt: string
  } | null
}

interface Message {
  id: string
  content: string | null
  senderId: string
  createdAt: string
  sender: {
    id: string
    name: string | null
    image: string | null
    playerProfile?: { firstName: string; lastName: string; profilePicture: string | null } | null
    agentProfile?: { firstName: string; lastName: string; profilePicture: string | null } | null
    clubProfile?: { clubName: string; logo: string | null } | null
  }
  attachments: Attachment[]
}

interface Conversation {
  id: string
  lastMessageAt: string | null
  participants: Participant[]
  messages: Message[]
}

interface ShareableReport {
  id: string
  title: string
  status: string
  authorType: string
  version: number
  createdAt: string
  subject: { firstName: string; lastName: string }
  author: { firstName: string; lastName: string }
}

interface PendingAttachment {
  type: "FILE" | "REPORT"
  file?: File
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  reportId?: string
  reportTitle?: string
}

function getParticipantName(p: Participant["user"]) {
  if (p.playerProfile) return `${p.playerProfile.firstName} ${p.playerProfile.lastName}`
  if (p.agentProfile) return `${p.agentProfile.firstName} ${p.agentProfile.lastName}`
  if (p.clubProfile) return p.clubProfile.clubName
  return p.name || "Utilisateur"
}

function getParticipantAvatar(p: Participant["user"]) {
  if (p.playerProfile?.profilePicture) return p.playerProfile.profilePicture
  if (p.agentProfile?.profilePicture) return p.agentProfile.profilePicture
  if (p.clubProfile?.logo) return p.clubProfile.logo
  return p.image
}

function getSenderName(s: Message["sender"]) {
  if (s.playerProfile) return `${s.playerProfile.firstName} ${s.playerProfile.lastName}`
  if (s.agentProfile) return `${s.agentProfile.firstName} ${s.agentProfile.lastName}`
  if (s.clubProfile) return s.clubProfile.clubName
  return s.name || "Utilisateur"
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return <File className="h-5 w-5" />
  if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />
  if (mimeType.startsWith("video/")) return <Film className="h-5 w-5" />
  if (mimeType.startsWith("audio/")) return <Music className="h-5 w-5" />
  if (mimeType.includes("pdf")) return <FileText className="h-5 w-5" />
  return <File className="h-5 w-5" />
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return ""
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 60000) return "maintenant"
  if (diff < 3600000) return `il y a ${Math.floor(diff / 60000)} min`
  if (diff < 86400000) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function MessagingPanel({
  currentUserId,
  recipientId,
  onClose,
}: {
  currentUserId: string
  recipientId?: string
  onClose: () => void
}) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [showReportPicker, setShowReportPicker] = useState(false)
  const [reports, setReports] = useState<ShareableReport[]>([])
  const [reportsLoading, setReportsLoading] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<NodeJS.Timeout>()
  const listPollRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const openOrCreateConversationCb = useCallback(async (targetUserId: string) => {
    try {
      const res = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: targetUserId }),
      })
      if (res.ok) {
        const data = await res.json()
        setActiveConversation(data.conversation)
        loadMessages(data.conversation.id)
        loadConversations()
      } else {
        console.error("Erreur creation conversation:", await res.text())
      }
    } catch (err) {
      console.error("Erreur creation conversation:", err)
    }
  }, [])

  useEffect(() => {
    async function init() {
      await loadConversations()
      if (recipientId) {
        await openOrCreateConversationCb(recipientId)
      }
    }
    init()
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      if (listPollRef.current) clearInterval(listPollRef.current)
    }
  }, [recipientId, openOrCreateConversationCb])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (listPollRef.current) clearInterval(listPollRef.current)
    listPollRef.current = setInterval(() => loadConversations(), 10000)
    return () => { if (listPollRef.current) clearInterval(listPollRef.current) }
  }, [])

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (activeConversation) {
      pollRef.current = setInterval(() => loadMessages(activeConversation.id), 5000)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [activeConversation])

  async function loadConversations() {
    try {
      const res = await fetch("/api/messages/conversations")
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations)
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const res = await fetch(`/api/messages/conversations/${conversationId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages)
      }
    } catch {}
  }

  async function handleSendMessage() {
    if ((!inputValue.trim() && pendingAttachments.length === 0) || !activeConversation) return
    setSendingMessage(true)
    try {
      const attachments = []

      for (const pa of pendingAttachments) {
        if (pa.type === "FILE" && pa.file) {
          setUploadingFile(true)
          const formData = new FormData()
          formData.append("file", pa.file)
          formData.append("fileType", "DOCUMENT")
          const uploadRes = await fetch("/api/files/upload-proxy", { method: "POST", body: formData })
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            attachments.push({
              type: "FILE" as const,
              fileUrl: uploadData.fileAsset.url,
              fileName: pa.file.name,
              fileSize: pa.file.size,
              mimeType: pa.file.type,
            })
          }
          setUploadingFile(false)
        } else if (pa.type === "REPORT" && pa.reportId) {
          attachments.push({
            type: "REPORT" as const,
            reportId: pa.reportId,
          })
        }
      }

      const res = await fetch(`/api/messages/conversations/${activeConversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: inputValue.trim() || null,
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setInputValue("")
        setPendingAttachments([])
        loadConversations()
      }
    } finally {
      setSendingMessage(false)
      setUploadingFile(false)
    }
  }

  async function loadReports() {
    setReportsLoading(true)
    try {
      const res = await fetch("/api/messages/reports")
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports)
      }
    } finally {
      setReportsLoading(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    const newAttachments: PendingAttachment[] = Array.from(files).map(file => ({
      type: "FILE",
      file,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    }))
    setPendingAttachments(prev => [...prev, ...newAttachments])
    setShowAttachMenu(false)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  function handleReportSelect(report: ShareableReport) {
    const already = pendingAttachments.some(a => a.type === "REPORT" && a.reportId === report.id)
    if (already) return
    setPendingAttachments(prev => [
      ...prev,
      {
        type: "REPORT",
        reportId: report.id,
        reportTitle: report.title,
      },
    ])
    setShowReportPicker(false)
  }

  function removePendingAttachment(index: number) {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index))
  }

  function getOtherParticipant(conv: Conversation) {
    return conv.participants.find(p => p.user.id !== currentUserId)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <AnimatePresence mode="wait">
        {!activeConversation ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col h-full"
          >
            <div className="p-4 border-b border-stadium-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-stadium-900">Messages</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-pitch-600" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="h-12 w-12 text-stadium-200 mx-auto mb-3" />
                  <p className="text-stadium-500 text-sm">Aucune conversation</p>
                  <p className="text-stadium-400 text-xs mt-1">
                    Envoyez un message depuis un profil pour commencer
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-stadium-50">
                  {conversations.map(conv => {
                    const other = getOtherParticipant(conv)
                    if (!other) return null
                    const avatar = getParticipantAvatar(other.user)
                    const name = getParticipantName(other.user)
                    const lastMsg = conv.messages[0]
                    const myParticipant = conv.participants.find(p => p.userId === currentUserId)
                    const isUnread = !!(
                      conv.lastMessageAt &&
                      myParticipant &&
                      (!myParticipant.lastReadAt || new Date(conv.lastMessageAt) > new Date(myParticipant.lastReadAt))
                    )

                    return (
                      <button
                        key={conv.id}
                        onClick={() => {
                          setActiveConversation(conv)
                          loadMessages(conv.id)
                        }}
                        className={cn(
                          "w-full p-4 flex items-center gap-3 hover:bg-stadium-50 transition-colors text-left",
                          isUnread && "bg-pitch-50/50"
                        )}
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pitch-100 to-pitch-200 flex items-center justify-center overflow-hidden">
                            {avatar ? (
                              <img src={avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-sm font-bold text-pitch-600">
                                {name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {isUnread && (
                            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-pitch-500 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-sm truncate",
                              isUnread ? "font-bold text-stadium-900" : "font-semibold text-stadium-900"
                            )}>{name}</p>
                            {lastMsg && (
                              <span className={cn(
                                "text-xs flex-shrink-0 ml-2",
                                isUnread ? "text-pitch-600 font-semibold" : "text-stadium-400"
                              )}>
                                {formatTime(lastMsg.createdAt)}
                              </span>
                            )}
                          </div>
                          {lastMsg && (
                            <p className={cn(
                              "text-xs truncate mt-0.5",
                              isUnread ? "text-stadium-700 font-medium" : "text-stadium-500"
                            )}>
                              {lastMsg.senderId === currentUserId ? "Vous: " : ""}
                              {lastMsg.content
                                ? lastMsg.content
                                : lastMsg.attachments.length > 0
                                  ? lastMsg.attachments[0].type === "REPORT"
                                    ? "Rapport partage"
                                    : "Piece jointe"
                                  : ""}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="conversation"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col h-full"
          >
            {/* Header conversation */}
            {(() => {
              const other = getOtherParticipant(activeConversation)
              const name = other ? getParticipantName(other.user) : ""
              const avatar = other ? getParticipantAvatar(other.user) : null
              return (
                <div className="p-3 border-b border-stadium-100 flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveConversation(null)
                      setMessages([])
                      loadConversations()
                    }}
                    className="p-1.5 rounded-full hover:bg-stadium-100 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-stadium-600" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pitch-100 to-pitch-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {avatar ? (
                      <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold text-pitch-600">
                        {name.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-stadium-900 text-sm truncate">{name}</p>
                  </div>
                </div>
              )
            })()}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-stadium-400 text-sm">Commencez la conversation</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.senderId === currentUserId
                  return (
                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[80%] space-y-1")}>
                        {msg.content && (
                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                              isMe
                                ? "bg-gradient-to-r from-pitch-600 to-pitch-700 text-white rounded-br-md"
                                : "bg-stadium-100 text-stadium-800 rounded-bl-md"
                            )}
                          >
                            {msg.content}
                          </div>
                        )}

                        {/* Pieces jointes */}
                        {msg.attachments.map(att => (
                          <div key={att.id}>
                            {att.type === "FILE" && att.mimeType?.startsWith("image/") && (
                              <a
                                href={att.fileUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block rounded-xl overflow-hidden max-w-[280px]"
                              >
                                <img
                                  src={att.fileUrl || ""}
                                  alt={att.fileName || "Image"}
                                  className="w-full h-auto rounded-xl object-cover max-h-[300px]"
                                  loading="lazy"
                                />
                              </a>
                            )}

                            {att.type === "FILE" && att.mimeType?.startsWith("video/") && (
                              <div className="rounded-xl overflow-hidden max-w-[300px]">
                                <video
                                  src={att.fileUrl || ""}
                                  controls
                                  preload="metadata"
                                  className="w-full h-auto rounded-xl max-h-[300px]"
                                />
                              </div>
                            )}

                            {att.type === "FILE" && att.mimeType?.startsWith("audio/") && (
                              <div className={cn(
                                "flex items-center gap-2.5 px-3 py-2 rounded-xl border",
                                isMe
                                  ? "bg-pitch-500/20 border-pitch-400/30"
                                  : "bg-white border-stadium-200"
                              )}>
                                <div className={cn(
                                  "p-1.5 rounded-lg",
                                  isMe ? "bg-pitch-500/30" : "bg-stadium-100"
                                )}>
                                  <Music className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                  <p className={cn("text-xs font-medium truncate", isMe ? "text-white" : "text-stadium-700")}>
                                    {att.fileName}
                                  </p>
                                  <audio src={att.fileUrl || ""} controls preload="metadata" className="w-full h-8" />
                                </div>
                              </div>
                            )}

                            {att.type === "FILE" && !att.mimeType?.startsWith("image/") && !att.mimeType?.startsWith("video/") && !att.mimeType?.startsWith("audio/") && (
                              <a
                                href={att.fileUrl || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-colors",
                                  isMe
                                    ? "bg-pitch-500/20 border-pitch-400/30 text-white hover:bg-pitch-500/30"
                                    : "bg-white border-stadium-200 text-stadium-700 hover:bg-stadium-50"
                                )}
                              >
                                <div className={cn(
                                  "p-1.5 rounded-lg",
                                  isMe ? "bg-pitch-500/30" : "bg-stadium-100"
                                )}>
                                  {getFileIcon(att.mimeType)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium truncate">{att.fileName}</p>
                                  <p className={cn("text-[10px]", isMe ? "text-pitch-200" : "text-stadium-400")}>
                                    {formatFileSize(att.fileSize)}
                                  </p>
                                </div>
                              </a>
                            )}

                            {att.type === "REPORT" && att.report && (
                              <a
                                href={`/shared/reports/${att.report.shareSlug || att.report.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "block px-3.5 py-3 rounded-xl border cursor-pointer transition-all",
                                  isMe
                                    ? "bg-gradient-to-r from-pitch-700 to-pitch-800 border-pitch-600 text-white hover:from-pitch-600 hover:to-pitch-700"
                                    : "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-stadium-800 hover:from-amber-100 hover:to-orange-100"
                                )}
                              >
                                <div className="flex items-center gap-2 mb-1.5">
                                  <ClipboardList className={cn("h-4 w-4", isMe ? "text-pitch-300" : "text-amber-600")} />
                                  <span className={cn("text-[10px] font-medium uppercase tracking-wider", isMe ? "text-pitch-300" : "text-amber-600")}>
                                    Rapport
                                  </span>
                                </div>
                                <p className="text-sm font-semibold">{att.report.title}</p>
                                <p className={cn("text-xs mt-0.5", isMe ? "text-white/70" : "text-stadium-500")}>
                                  {att.report.subject.firstName} {att.report.subject.lastName}
                                  {" - "}
                                  {att.report.authorType}
                                </p>
                              </a>
                            )}
                          </div>
                        ))}

                        <p className={cn(
                          "text-[10px] px-1",
                          isMe ? "text-right text-stadium-400" : "text-stadium-400"
                        )}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Pieces jointes en attente */}
            {pendingAttachments.length > 0 && (
              <div className="px-4 pt-2 flex flex-wrap gap-2">
                {pendingAttachments.map((att, i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative bg-stadium-50 border border-stadium-200 rounded-lg text-xs",
                      att.type === "FILE" && att.mimeType?.startsWith("image/")
                        ? "w-16 h-16 overflow-hidden"
                        : "flex items-center gap-2 px-2.5 py-1.5"
                    )}
                  >
                    {att.type === "FILE" && att.mimeType?.startsWith("image/") && att.file ? (
                      <img
                        src={URL.createObjectURL(att.file)}
                        alt={att.fileName || ""}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : att.type === "FILE" ? (
                      <>
                        {getFileIcon(att.mimeType || null)}
                        <span className="max-w-[120px] truncate">{att.fileName}</span>
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-4 w-4 text-amber-600" />
                        <span className="max-w-[120px] truncate">{att.reportTitle}</span>
                      </>
                    )}
                    <button
                      onClick={() => removePendingAttachment(i)}
                      className={cn(
                        "hover:bg-stadium-200 rounded",
                        att.type === "FILE" && att.mimeType?.startsWith("image/")
                          ? "absolute top-0.5 right-0.5 p-0.5 bg-black/50 rounded-full"
                          : "p-0.5"
                      )}
                    >
                      <X className={cn(
                        "h-3 w-3",
                        att.type === "FILE" && att.mimeType?.startsWith("image/") ? "text-white" : ""
                      )} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Barre de saisie */}
            <div className="p-3 border-t border-stadium-100">
              <div className="flex items-end gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="p-2 rounded-full hover:bg-stadium-100 transition-colors text-stadium-500"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>

                  <AnimatePresence>
                    {showAttachMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-12 left-0 bg-white rounded-xl shadow-xl border border-stadium-200 overflow-hidden z-10 w-52"
                      >
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stadium-50 transition-colors text-left"
                        >
                          <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Paperclip className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stadium-800">Fichier</p>
                            <p className="text-[10px] text-stadium-400">Image, PDF, video...</p>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            setShowAttachMenu(false)
                            setShowReportPicker(true)
                            loadReports()
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stadium-50 transition-colors text-left border-t border-stadium-100"
                        >
                          <div className="p-1.5 bg-amber-100 rounded-lg">
                            <ClipboardList className="h-4 w-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-stadium-800">Rapport</p>
                            <p className="text-[10px] text-stadium-400">Partager un rapport</p>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                />

                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Votre message..."
                    rows={1}
                    className="w-full resize-none rounded-2xl border border-stadium-200 bg-stadium-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pitch-500 focus:border-transparent placeholder:text-stadium-400"
                  />
                </div>

                <Button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || (!inputValue.trim() && pendingAttachments.length === 0)}
                  size="sm"
                  className="rounded-full h-10 w-10 p-0 bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 shadow-lg shadow-pitch-200 disabled:opacity-50"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog : Choix de rapport */}
      <Dialog open={showReportPicker} onOpenChange={setShowReportPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Partager un rapport</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto">
            {reportsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-pitch-600" />
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-10 w-10 text-stadium-200 mx-auto mb-2" />
                <p className="text-sm text-stadium-500">Aucun rapport disponible</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map(report => {
                  const isSelected = pendingAttachments.some(
                    a => a.type === "REPORT" && a.reportId === report.id
                  )
                  return (
                    <button
                      key={report.id}
                      onClick={() => handleReportSelect(report)}
                      disabled={isSelected}
                      className={cn(
                        "w-full text-left p-3 rounded-xl border transition-all",
                        isSelected
                          ? "bg-pitch-50 border-pitch-300 opacity-60"
                          : "bg-white border-stadium-200 hover:border-pitch-400 hover:bg-pitch-50/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-stadium-800">{report.title}</p>
                        {isSelected && <Check className="h-4 w-4 text-pitch-600" />}
                      </div>
                      <p className="text-xs text-stadium-500 mt-0.5">
                        {report.subject.firstName} {report.subject.lastName}
                        {" - "}
                        v{report.version}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          report.status === "APPROVED"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        )}>
                          {report.status === "APPROVED" ? "Approuve" : "Brouillon"}
                        </span>
                        <span className="text-[10px] text-stadium-400">
                          {new Date(report.createdAt).toLocaleDateString("fr-FR")}
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
