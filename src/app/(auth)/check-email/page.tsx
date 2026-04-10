// Après inscription : rappel de vérifier la boîte mail
"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { FootballIcon } from "@/components/auth/icons"

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pitch-50 via-white to-pitch-50">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-pitch-500 border-t-transparent rounded-full"
          />
        </div>
      }
    >
      <CheckEmailContent />
    </Suspense>
  )
}

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")?.trim() || ""
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<{
    type: "ok" | "err"
    text: string
  } | null>(null)

  const handleResend = async () => {
    if (!email || resendLoading) return
    setResendLoading(true)
    setResendMessage(null)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setResendMessage({
          type: "ok",
          text: "Si cette adresse est enregistrée et non vérifiée, un nouvel e-mail vient d’être envoyé.",
        })
      } else {
        setResendMessage({
          type: "err",
          text:
            data.error ||
            (response.status === 429
              ? "Trop de demandes. Patientez avant de réessayer."
              : "Impossible d’envoyer l’e-mail pour le moment."),
        })
      }
    } catch {
      setResendMessage({ type: "err", text: "Erreur réseau. Réessayez." })
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pitch-50 via-white to-pitch-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
        className="text-center max-w-md w-full"
      >
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <FootballIcon className="w-12 h-12 rounded-xl" />
          <span className="text-2xl font-bold text-stadium-900">Profoot Profile</span>
        </Link>

        <div className="w-20 h-20 bg-pitch-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-11 h-11 text-pitch-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-stadium-900 mb-3">
          Vérifiez votre e-mail
        </h1>
        <p className="text-stadium-600 text-[15px] leading-relaxed mb-2">
          Nous avons envoyé un lien de confirmation
          {email ? (
            <>
              {" "}
              à <span className="font-medium text-stadium-800">{email}</span>
            </>
          ) : null}
          . Ouvrez ce message et cliquez sur le lien pour activer votre compte.
        </p>
        <p className="text-stadium-500 text-sm mb-8">
          Vous pourrez vous connecter une fois l’adresse confirmée.
        </p>

        {resendMessage && (
          <p
            className={`text-sm mb-4 ${resendMessage.type === "ok" ? "text-pitch-700" : "text-red-600"}`}
          >
            {resendMessage.text}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {email ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="w-full h-12 border-2 border-stadium-200 text-stadium-800 font-semibold rounded-xl hover:bg-stadium-50 transition-colors disabled:opacity-60"
            >
              {resendLoading ? "Envoi…" : "Renvoyer l’e-mail de confirmation"}
            </button>
          ) : null}
          <Link
            href="/login"
            className="w-full h-12 flex items-center justify-center bg-pitch-500 text-white font-semibold rounded-xl hover:bg-pitch-600 transition-colors shadow-lg shadow-pitch-500/25"
          >
            Aller à la connexion
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
