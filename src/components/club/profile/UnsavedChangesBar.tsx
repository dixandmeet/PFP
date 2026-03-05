"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, Save, X, AlertTriangle } from "lucide-react"

interface UnsavedChangesBarProps {
  /** Le formulaire a-t-il des modifications non enregistrées ? */
  isDirty: boolean
  /** Le formulaire est-il en cours de soumission ? */
  isSubmitting: boolean
  /** Callback pour soumettre le formulaire */
  onSave: () => void
  /** Callback pour annuler / réinitialiser */
  onCancel: () => void
}

export function UnsavedChangesBar({
  isDirty,
  isSubmitting,
  onSave,
  onCancel,
}: UnsavedChangesBarProps) {
  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="sticky bottom-0 z-40 -mx-6 -mb-6 mt-4 border-t border-stadium-200 bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
        >
          <div className="px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Message */}
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                </div>
                <span>Modifications non enregistrées</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  animated={false}
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="text-stadium-600 hover:text-stadium-800"
                  aria-label="Annuler les modifications"
                >
                  <X className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
                <Button
                  type="button"
                  size="sm"
                  animated={false}
                  onClick={onSave}
                  disabled={isSubmitting}
                  className="bg-pitch-600 hover:bg-pitch-700 text-white font-semibold shadow-sm"
                  aria-label="Enregistrer les modifications"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                      Enregistrement…
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-1.5" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
