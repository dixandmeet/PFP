"use client"

import { useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Download,
  Shield,
  CreditCard,
  Home,
  Car,
  FileCheck,
  Building2,
  Landmark,
  File,
  RefreshCw,
  Plus,
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import type { KycDocumentEntry } from "./types"

interface UserDocumentsSectionProps {
  documents: KycDocumentEntry[]
  userId: string
  onRefresh: () => void
}

const documentTypeConfig: Record<string, { label: string; icon: typeof FileText; description: string }> = {
  IDENTITY_CARD: { label: "Carte d'identite", icon: CreditCard, description: "Recto/verso de la carte d'identite" },
  PASSPORT: { label: "Passeport", icon: Shield, description: "Page photo du passeport" },
  DRIVING_LICENSE: { label: "Permis de conduire", icon: Car, description: "Permis de conduire en cours de validite" },
  PROOF_OF_ADDRESS: { label: "Justificatif de domicile", icon: Home, description: "Facture ou attestation de moins de 3 mois" },
  AGENT_LICENSE: { label: "Licence d'agent", icon: FileCheck, description: "Licence ou certification d'agent sportif" },
  CLUB_REGISTRATION: { label: "Enregistrement club", icon: Building2, description: "Document officiel d'enregistrement du club" },
  BANK_DETAILS: { label: "RIB / Coordonnees bancaires", icon: Landmark, description: "Releve d'identite bancaire" },
  OTHER: { label: "Autre document", icon: File, description: "Document complementaire" },
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  PENDING: { label: "En attente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "Approuve", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Rejete", color: "bg-red-100 text-red-700 border-red-200", icon: XCircle },
  EXPIRED: { label: "Expire", color: "bg-slate-100 text-slate-600 border-slate-200", icon: AlertTriangle },
}

export function UserDocumentsSection({ documents, userId, onRefresh }: UserDocumentsSectionProps) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<KycDocumentEntry | null>(null)
  const [reviewStatus, setReviewStatus] = useState("")
  const [rejectionReason, setRejectionReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Upload form state
  const [uploadType, setUploadType] = useState("IDENTITY_CARD")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const pendingCount = documents.filter((d) => d.status === "PENDING").length
  const approvedCount = documents.filter((d) => d.status === "APPROVED").length
  const rejectedCount = documents.filter((d) => d.status === "REJECTED").length

  const handleUpload = async () => {
    if (!uploadFile) return

    setIsUploading(true)
    try {
      // Step 1: Upload file directly
      const formData = new FormData()
      formData.append("file", uploadFile)
      formData.append("fileType", "DOCUMENT")

      const uploadRes = await fetch("/api/files/upload-direct", {
        method: "POST",
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({}))
        throw new Error(err.error || "Echec de l'upload du fichier")
      }

      const uploadData = await uploadRes.json()

      // Step 2: Create KYC document record
      const docRes = await fetch(`/api/admin/users/${userId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: uploadType,
          fileName: uploadFile.name,
          fileUrl: uploadData.url,
          fileSize: uploadFile.size,
          mimeType: uploadFile.type,
        }),
      })

      if (!docRes.ok) {
        const err = await docRes.json().catch(() => ({}))
        throw new Error(err.error || "Impossible de creer le document")
      }

      toast({ title: "Document ajoute avec succes" })
      setUploadDialogOpen(false)
      setUploadFile(null)
      setUploadType("IDENTITY_CARD")
      onRefresh()
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'uploader le document",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleReview = async () => {
    if (!selectedDoc || !reviewStatus) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/documents`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          status: reviewStatus,
          rejectionReason: reviewStatus === "REJECTED" ? rejectionReason : undefined,
        }),
      })

      if (!res.ok) {
        throw new Error("Impossible de mettre a jour le document")
      }

      toast({
        title: reviewStatus === "APPROVED" ? "Document approuve" : "Document rejete",
      })
      setReviewDialogOpen(false)
      setSelectedDoc(null)
      setReviewStatus("")
      setRejectionReason("")
      onRefresh()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre a jour le statut",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm("Supprimer ce document definitivement ?")) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/documents?documentId=${docId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error()

      toast({ title: "Document supprime" })
      onRefresh()
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le document",
        variant: "destructive",
      })
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "-"
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  }

  const openReview = (doc: KycDocumentEntry) => {
    setSelectedDoc(doc)
    setReviewStatus("")
    setRejectionReason("")
    setReviewDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Documents KYC</h3>
          <p className="text-sm text-slate-500">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
            {pendingCount > 0 && (
              <span className="text-amber-600 font-medium"> · {pendingCount} en attente</span>
            )}
            {approvedCount > 0 && (
              <span className="text-emerald-600 font-medium"> · {approvedCount} approuve{approvedCount !== 1 ? "s" : ""}</span>
            )}
          </p>
        </div>
        <Button size="sm" onClick={() => setUploadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Ajouter un document
        </Button>
      </div>

      {/* Status summary cards */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 border-slate-200">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-medium text-slate-500 uppercase">Total</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-1">{documents.length}</p>
        </Card>
        <Card className="p-3 border-amber-200 bg-amber-50/30">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-600 uppercase">En attente</span>
          </div>
          <p className="text-xl font-bold text-amber-700 mt-1">{pendingCount}</p>
        </Card>
        <Card className="p-3 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-600 uppercase">Approuves</span>
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-1">{approvedCount}</p>
        </Card>
        <Card className="p-3 border-red-200 bg-red-50/30">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-xs font-medium text-red-500 uppercase">Rejetes</span>
          </div>
          <p className="text-xl font-bold text-red-600 mt-1">{rejectedCount}</p>
        </Card>
      </div>

      {/* Documents list */}
      {documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500">Aucun document KYC</p>
          <p className="text-xs text-slate-400 mt-1">
            Ajoutez des documents pour la verification d&apos;identite
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="h-4 w-4 mr-1.5" />
            Ajouter un document
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const typeConf = documentTypeConfig[doc.type] || documentTypeConfig.OTHER
            const statConf = statusConfig[doc.status] || statusConfig.PENDING
            const TypeIcon = typeConf.icon
            const StatusIcon = statConf.icon

            return (
              <Card key={doc.id} className="overflow-hidden">
                <div className="flex items-center gap-4 p-4">
                  {/* Icon */}
                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <TypeIcon className="h-5 w-5 text-slate-600" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-slate-900">{typeConf.label}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statConf.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statConf.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>{doc.mimeType || "Inconnu"}</span>
                      <span>
                        Ajoute {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                      {doc.expiresAt && (
                        <span className={new Date(doc.expiresAt) < new Date() ? "text-red-500 font-medium" : ""}>
                          Expire le {format(new Date(doc.expiresAt), "dd/MM/yyyy", { locale: fr })}
                        </span>
                      )}
                    </div>
                    {doc.status === "REJECTED" && doc.rejectionReason && (
                      <div className="flex items-start gap-1.5 mt-2 p-2 bg-red-50 rounded-md">
                        <XCircle className="h-3.5 w-3.5 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-600">{doc.rejectionReason}</p>
                      </div>
                    )}
                    {doc.reviewedAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        Verifie le {format(new Date(doc.reviewedAt), "dd/MM/yyyy HH:mm", { locale: fr })}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => window.open(doc.fileUrl, "_blank")}
                      title="Voir le document"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        const a = document.createElement("a")
                        a.href = doc.fileUrl
                        a.download = doc.fileName
                        a.click()
                      }}
                      title="Telecharger"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    {doc.status === "PENDING" && (
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={() => openReview(doc)}
                      >
                        Verifier
                      </Button>
                    )}
                    {doc.status !== "PENDING" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => openReview(doc)}
                      >
                        Modifier
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(doc.id)}
                      title="Supprimer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Ajouter un document KYC</DialogTitle>
            <DialogDescription>
              Selectionnez le type de document et le fichier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-sm">Type de document</Label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(documentTypeConfig).map(([key, conf]) => (
                    <SelectItem key={key} value={key}>
                      {conf.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                {documentTypeConfig[uploadType]?.description}
              </p>
            </div>

            <div>
              <Label className="text-sm">Fichier</Label>
              <div className="mt-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                />
                {uploadFile ? (
                  <div className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50 overflow-hidden">
                    <FileText className="h-4 w-4 text-slate-500 shrink-0" />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-sm font-medium text-slate-700 truncate max-w-[240px]">
                        {uploadFile.name}
                      </p>
                      <p className="text-xs text-slate-400">{formatFileSize(uploadFile.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs shrink-0"
                      onClick={() => {
                        setUploadFile(null)
                        if (fileInputRef.current) fileInputRef.current.value = ""
                      }}
                    >
                      Changer
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full h-20 border-dashed"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-xs text-slate-500">
                        Cliquez pour selectionner un fichier
                      </span>
                      <span className="text-xs text-slate-400">
                        PDF, JPG, PNG (max 10 Mo)
                      </span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false)
                setUploadFile(null)
              }}
              disabled={isUploading}
            >
              Annuler
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile || isUploading}>
              {isUploading ? (
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-1.5" />
              )}
              {isUploading ? "Upload..." : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Verifier le document</DialogTitle>
            <DialogDescription>
              {selectedDoc && (
                <>
                  {documentTypeConfig[selectedDoc.type]?.label || selectedDoc.type}
                  {" — "}
                  {selectedDoc.fileName}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-4 py-2">
              {/* Preview link */}
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open(selectedDoc.fileUrl, "_blank")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ouvrir le document dans un nouvel onglet
              </Button>

              {/* Status selection */}
              <div>
                <Label className="text-sm">Statut</Label>
                <Select value={reviewStatus} onValueChange={setReviewStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choisir un statut..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPROVED">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Approuver
                      </span>
                    </SelectItem>
                    <SelectItem value="REJECTED">
                      <span className="flex items-center gap-2">
                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                        Rejeter
                      </span>
                    </SelectItem>
                    <SelectItem value="PENDING">
                      <span className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        Remettre en attente
                      </span>
                    </SelectItem>
                    <SelectItem value="EXPIRED">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-slate-500" />
                        Marquer comme expire
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rejection reason */}
              {reviewStatus === "REJECTED" && (
                <div>
                  <Label className="text-sm">Raison du rejet</Label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Expliquez pourquoi le document est rejete..."
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewDialogOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              onClick={handleReview}
              disabled={!reviewStatus || isSubmitting}
              variant={reviewStatus === "REJECTED" ? "destructive" : "default"}
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
              ) : reviewStatus === "APPROVED" ? (
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
              ) : reviewStatus === "REJECTED" ? (
                <XCircle className="h-4 w-4 mr-1.5" />
              ) : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
