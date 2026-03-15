"use client"

import { useEffect, useCallback } from "react"

/**
 * Hook pour gérer l'avertissement de modifications non enregistrées.
 *
 * - Affiche un dialog natif `beforeunload` si le formulaire est dirty
 *   (fermeture d'onglet, refresh, navigation externe).
 * - Retourne un helper `confirmNavigation` pour les navigations internes
 *   (ex: router.push) si besoin.
 */
export function useUnsavedChanges(isDirty: boolean) {
  // Avertissement natif du navigateur (fermeture onglet / refresh)
  useEffect(() => {
    if (!isDirty) return

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // Certains navigateurs nécessitent returnValue
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [isDirty])

  // Helper pour les navigations internes (router.push, etc.)
  const confirmNavigation = useCallback((): boolean => {
    if (!isDirty) return true
    return window.confirm(
      "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?"
    )
  }, [isDirty])

  return { confirmNavigation }
}
