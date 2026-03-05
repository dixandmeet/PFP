"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

const COOKIE_CONSENT_KEY = "pfp-cookie-consent"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted")
    setVisible(false)
  }

  const refuse = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "refused")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="max-w-4xl mx-auto bg-base-100 border border-base-300/50 rounded-2xl shadow-2xl shadow-black/10 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-base-content leading-relaxed">
                    Nous utilisons des cookies pour ameliorer votre experience sur Profoot Profile.
                    En continuant, vous acceptez notre{" "}
                    <Link href="/cookies" className="text-primary font-medium hover:underline">
                      politique de cookies
                    </Link>
                    {" "}et notre{" "}
                    <Link href="/privacy" className="text-primary font-medium hover:underline">
                      politique de confidentialite
                    </Link>.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                <button
                  onClick={refuse}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-xl border-2 border-base-300 text-base-content hover:bg-base-200/50 transition-all"
                >
                  Refuser
                </button>
                <button
                  onClick={accept}
                  className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold rounded-xl bg-primary text-primary-content shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                >
                  Accepter
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
