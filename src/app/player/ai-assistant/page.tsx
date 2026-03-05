"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Bot, Send, User, CheckCircle, AlertCircle } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface PendingAction {
  id: string
  toolName: string
  params: any
  preview: string
}

export default function PlayerAIAssistantPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<{ message: string }>()

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim()) return

    const userMessage: Message = {
      role: "user",
      content: data.message,
      timestamp: new Date(),
    }

    setMessages([...messages, userMessage])
    setLoading(true)
    reset()

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: data.message }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      const result = await response.json()

      if (result.type === "text_response") {
        const assistantMessage: Message = {
          role: "assistant",
          content: result.content,
          timestamp: new Date(),
        }
        setMessages([...messages, userMessage, assistantMessage])
      } else if (result.type === "tool_call_proposal") {
        const assistantMessage: Message = {
          role: "assistant",
          content: result.preview,
          timestamp: new Date(),
        }
        setMessages([...messages, userMessage, assistantMessage])
        
        setPendingAction({
          id: result.pendingActionId,
          toolName: result.toolName,
          params: result.params,
          preview: result.preview,
        })
        setConfirmDialogOpen(true)
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
      
      const errorMessage: Message = {
        role: "assistant",
        content: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        timestamp: new Date(),
      }
      setMessages([...messages, userMessage, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const confirmAction = async () => {
    if (!pendingAction) return

    setLoading(true)
    try {
      const response = await fetch("/api/ai/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pendingActionId: pendingAction.id }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur")
      }

      const result = await response.json()

      const confirmMessage: Message = {
        role: "assistant",
        content: `✅ Action exécutée avec succès : ${result.message || "Terminé"}`,
        timestamp: new Date(),
      }
      setMessages([...messages, confirmMessage])

      toast({
        title: "Succès",
        description: "Action exécutée",
      })

      setConfirmDialogOpen(false)
      setPendingAction(null)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Assistant IA Player Agent</h1>
            <p className="text-gray-600 mt-1">
              Votre copilote pour améliorer votre carrière
            </p>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length === 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Que puis-je faire pour vous ?</CardTitle>
            <CardDescription>Exemples de demandes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
                onClick={() => {
                  const input = document.querySelector("textarea") as HTMLTextAreaElement
                  if (input) {
                    input.value = "Améliore mon profil"
                    input.focus()
                  }
                }}
              >
                Améliore mon profil
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
                onClick={() => {
                  const input = document.querySelector("textarea") as HTMLTextAreaElement
                  if (input) {
                    input.value = "Trouve des annonces qui me correspondent"
                    input.focus()
                  }
                }}
              >
                Trouve des annonces qui me correspondent
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
                onClick={() => {
                  const input = document.querySelector("textarea") as HTMLTextAreaElement
                  if (input) {
                    input.value = "Rédige un post professionnel sur ma dernière performance"
                    input.focus()
                  }
                }}
              >
                Rédige un post professionnel
              </Button>
              <Button
                variant="outline"
                className="justify-start text-left h-auto py-3"
                onClick={() => {
                  const input = document.querySelector("textarea") as HTMLTextAreaElement
                  if (input) {
                    input.value = "Aide-moi à rédiger une lettre de motivation"
                    input.focus()
                  }
                }}
              >
                Aide-moi à rédiger une lettre
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conversation */}
      <Card className="mb-6 min-h-[400px]">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <p
                    className={`text-xs mt-2 ${
                      message.role === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Input */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <Textarea
              {...register("message", { required: true })}
              placeholder="Posez une question ou demandez une action..."
              rows={2}
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dialog confirmation */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Confirmer l'action
            </DialogTitle>
            <DialogDescription>
              L'assistant souhaite effectuer l'action suivante
            </DialogDescription>
          </DialogHeader>

          {pendingAction && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Action : {pendingAction.toolName}
              </p>
              <p className="text-sm text-blue-800">{pendingAction.preview}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setConfirmDialogOpen(false)
                setPendingAction(null)
              }}
            >
              Annuler
            </Button>
            <Button onClick={confirmAction} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exécution...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
