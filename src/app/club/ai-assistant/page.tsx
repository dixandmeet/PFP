"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Bot, Send, User, CheckCircle, AlertCircle } from "lucide-react"

interface Message { role: "user" | "assistant"; content: string; timestamp: Date }

export default function ClubAIAssistantPage() {
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState<any>(null)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<{ message: string }>()

  const onSubmit = async (data: { message: string }) => {
    if (!data.message.trim()) return
    const userMsg: Message = { role: "user", content: data.message, timestamp: new Date() }
    setMessages([...messages, userMsg])
    setLoading(true)
    reset()

    try {
      const r = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: data.message }) })
      if (!r.ok) throw new Error()
      const result = await r.json()
      
      if (result.type === "text_response") {
        setMessages([...messages, userMsg, { role: "assistant", content: result.content, timestamp: new Date() }])
      } else if (result.type === "tool_call_proposal") {
        setMessages([...messages, userMsg, { role: "assistant", content: result.preview, timestamp: new Date() }])
        setPendingAction(result)
        setConfirmDialogOpen(true)
      }
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
      setMessages([...messages, userMsg, { role: "assistant", content: "Erreur.", timestamp: new Date() }])
    } finally {
      setLoading(false)
    }
  }

  const confirmAction = async () => {
    if (!pendingAction) return
    setLoading(true)
    try {
      const r = await fetch("/api/ai/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pendingActionId: pendingAction.pendingActionId }) })
      if (!r.ok) throw new Error()
      const result = await r.json()
      setMessages([...messages, { role: "assistant", content: `✅ ${result.message || "Terminé"}`, timestamp: new Date() }])
      toast({ title: "Succès" })
      setConfirmDialogOpen(false)
      setPendingAction(null)
    } catch {
      toast({ title: "Erreur", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Bot className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Assistant IA Club Scout</h1>
          <p className="text-gray-600 mt-1">Optimisez votre recrutement</p>
        </div>
      </div>

      {messages.length === 0 && (
        <Card className="mb-6">
          <CardHeader><CardTitle>Suggestions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              <Button variant="outline">Score les candidatures</Button>
              <Button variant="outline">Compare des joueurs</Button>
              <Button variant="outline">Génère une shortlist</Button>
              <Button variant="outline">Recherche des joueurs</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6 min-h-[400px]">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Bot className="h-5 w-5 text-blue-600" /></div>}
                <div className={`max-w-[80%] rounded-lg px-4 py-3 ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === "user" && <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center"><User className="h-5 w-5" /></div>}
              </div>
            ))}
            {loading && <div className="flex gap-3"><div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center"><Bot className="h-5 w-5" /></div><div className="bg-gray-100 rounded-lg px-4 py-3"><Loader2 className="h-5 w-5 animate-spin" /></div></div>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
            <Textarea {...register("message", { required: true })} placeholder="Votre message..." rows={2} className="flex-1" disabled={loading} />
            <Button type="submit" disabled={loading}><Send className="h-4 w-4" /></Button>
          </form>
        </CardContent>
      </Card>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><AlertCircle className="h-5 w-5 text-orange-600" />Confirmer</DialogTitle>
          </DialogHeader>
          {pendingAction && <div className="bg-blue-50 p-4 rounded-md"><p className="text-sm">{pendingAction.preview}</p></div>}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setConfirmDialogOpen(false); setPendingAction(null); }}>Annuler</Button>
            <Button onClick={confirmAction} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}Confirmer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
