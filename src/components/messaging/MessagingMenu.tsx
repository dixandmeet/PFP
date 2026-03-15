"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { MessagingPanel } from "./MessagingPanel"
import { cn } from "@/lib/utils"

export function MessagingMenu({
  currentUserId,
  recipientId,
  autoOpen = false,
}: {
  currentUserId: string
  recipientId?: string
  autoOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(autoOpen)

  useEffect(() => {
    if (autoOpen) {
      setIsOpen(true)
    }
  }, [autoOpen])

  return (
    <>
      {/* Bouton flottant */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-pitch-600 to-pitch-700 text-white shadow-xl shadow-pitch-300/40 hover:shadow-pitch-400/50 hover:from-pitch-700 hover:to-pitch-800 transition-all flex items-center justify-center"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panneau de messagerie */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] rounded-2xl shadow-2xl border border-stadium-200 overflow-hidden bg-white"
          >
            <MessagingPanel
              currentUserId={currentUserId}
              recipientId={recipientId}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
