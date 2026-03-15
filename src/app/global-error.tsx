"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          backgroundColor: "#fafafa",
        }}>
          <div style={{ textAlign: "center", maxWidth: 420, padding: 24 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
              Une erreur est survenue
            </h2>
            <p style={{ color: "#71717a", marginBottom: 24 }}>
              Nous avons été notifiés et travaillons à résoudre le problème.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                backgroundColor: "#16a34a",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
