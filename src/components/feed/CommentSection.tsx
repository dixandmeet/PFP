"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { CommentItem } from "./CommentItem"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

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

interface CommentSectionProps {
  postId: string
  currentUserId: string
  initialCommentCount?: number
}

export function CommentSection({
  postId,
  currentUserId,
  initialCommentCount = 0,
}: CommentSectionProps) {
  const { toast } = useToast()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [posting, setPosting] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)

  const { register, handleSubmit, reset } = useForm<{ content: string }>()

  // Charger les commentaires quand la section est ouverte
  useEffect(() => {
    if (showComments && comments.length === 0) {
      loadComments()
    }
  }, [showComments])

  const loadComments = async (pageNum = 1) => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments?page=${pageNum}&limit=10`
      )
      if (!response.ok) throw new Error("Erreur")

      const data = await response.json()
      
      if (pageNum === 1) {
        setComments(data.comments || [])
      } else {
        setComments((prev) => [...prev, ...(data.comments || [])])
      }
      
      setHasMore(data.pagination.page < data.pagination.totalPages)
      setPage(pageNum)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data: { content: string }) => {
    if (!data.content.trim()) return

    setPosting(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: data.content }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      const newComment = await response.json()
      setComments([...comments, newComment])

      toast({
        title: "Succès",
        description: "Commentaire publié",
      })

      reset()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setPosting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) throw new Error("Erreur")

      setComments(comments.filter((c) => c.id !== commentId))

      toast({
        title: "Succès",
        description: "Commentaire supprimé",
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le commentaire",
        variant: "destructive",
      })
    }
  }

  const toggleComments = () => {
    setShowComments(!showComments)
  }

  return (
    <div className="border-t-2 border-pitch-100 pt-4">
      {/* Toggle button */}
      <Button
        variant="ghost"
        onClick={toggleComments}
        className="w-full justify-start gap-2 font-semibold text-stadium-600 hover:text-pitch-600 hover:bg-pitch-50 mb-3"
      >
        <MessageSquare className="h-5 w-5" />
        <span>
          {showComments ? "Masquer" : "Voir"} les commentaires
          {comments.length > 0 && ` (${comments.length})`}
        </span>
      </Button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Liste des commentaires */}
            {loading && comments.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-pitch-600" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-6 text-stadium-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Aucun commentaire pour le moment</p>
                <p className="text-xs">Soyez le premier à commenter !</p>
              </div>
            ) : (
              <div className="space-y-1 mb-4 max-h-96 overflow-y-auto">
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    currentUserId={currentUserId}
                    onDelete={handleDelete}
                  />
                ))}

                {/* Bouton "Charger plus" */}
                {hasMore && (
                  <div className="text-center py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => loadComments(page + 1)}
                      disabled={loading}
                      className="text-pitch-600 hover:text-pitch-700"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Chargement...
                        </>
                      ) : (
                        "Charger plus de commentaires"
                      )}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Formulaire d'ajout de commentaire */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <Textarea
                {...register("content", {
                  required: true,
                  minLength: 1,
                  maxLength: 2000,
                })}
                placeholder="Ajouter un commentaire..."
                rows={2}
                className="border-2 border-pitch-100 focus:border-pitch-300 resize-none"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={posting}
                  size="sm"
                  className="bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-bold"
                >
                  {posting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Commenter
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
