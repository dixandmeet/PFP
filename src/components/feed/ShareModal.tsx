"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { 
  Copy, 
  Check, 
  Share2, 
  Link2,
  Send,
  Loader2
} from "lucide-react"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
  onShare: () => void
}

export function ShareModal({ open, onOpenChange, postId, onShare }: ShareModalProps) {
  const { toast } = useToast()
  const [comment, setComment] = useState("")
  const [sharing, setSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  const postUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/feed?postId=${postId}`
    : ''

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast({
        title: "Lien copié",
        description: "Le lien du post a été copié dans le presse-papier",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      })
    }
  }

  const handleShare = async () => {
    setSharing(true)
    try {
      const response = await fetch(`/api/posts/${postId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: comment || undefined }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      toast({
        title: "Post partagé",
        description: "Le post a été partagé avec succès",
      })

      onShare()
      onOpenChange(false)
      setComment("")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setSharing(false)
    }
  }

  const handleShareExternal = (platform: 'twitter' | 'linkedin') => {
    let url = ''
    
    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent('Découvrez ce post sur ProFoot Profile !')}`
    } else if (platform === 'linkedin') {
      url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-pitch-200 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-pitch-500 to-pitch-600 rounded-lg">
              <Share2 className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl font-black text-stadium-900">
              Partager ce post
            </DialogTitle>
          </div>
          <DialogDescription className="text-stadium-600">
            Partagez ce post avec votre réseau ou copiez le lien
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copier le lien */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stadium-900">
              Lien du post
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={postUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm border-2 border-stadium-200 rounded-lg bg-stadium-50 text-stadium-700"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-2 border-pitch-200 hover:bg-pitch-50"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Partage avec commentaire */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-stadium-900">
              Ajouter un commentaire (optionnel)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Dites quelque chose à propos de ce post..."
              rows={3}
              maxLength={500}
              className="border-2 border-pitch-100 focus:border-pitch-300 resize-none"
            />
            <p className="text-xs text-stadium-500 text-right">
              {comment.length}/500
            </p>
          </div>

          {/* Bouton de partage */}
          <Button
            onClick={handleShare}
            disabled={sharing}
            className="w-full bg-gradient-to-r from-pitch-600 to-pitch-700 hover:from-pitch-700 hover:to-pitch-800 text-white font-bold shadow-lg"
          >
            {sharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Partage en cours...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Partager sur ProFoot
              </>
            )}
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-stadium-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stadium-500 font-semibold">
                Ou partager sur
              </span>
            </div>
          </div>

          {/* Partage externe */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShareExternal('twitter')}
              variant="outline"
              className="border-2 border-stadium-200 hover:border-[#1DA1F2] hover:bg-[#1DA1F2]/5"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#1DA1F2">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </Button>
            <Button
              onClick={() => handleShareExternal('linkedin')}
              variant="outline"
              className="border-2 border-stadium-200 hover:border-[#0077B5] hover:bg-[#0077B5]/5"
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="#0077B5">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
