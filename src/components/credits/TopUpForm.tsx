"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Coins, CreditCard, Loader2 } from "lucide-react"

const presetAmounts = [10, 25, 50, 100, 200, 500]

const pricePerCredit = 1

export function TopUpForm() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const amount = selectedAmount || Number(customAmount) || 0

  const handleTopUp = async () => {
    if (amount < 1) return
    setLoading(true)
    try {
      const res = await fetch("/api/credits/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credits: amount, returnUrl: window.location.origin + window.location.pathname }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.sessionUrl) {
          window.location.href = data.sessionUrl
        }
      }
    } catch {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-stadium-700 mb-3">Choisir un montant</h3>
        <p className="text-xs text-stadium-500 mb-3">1 crédit = 1 €</p>
        <div className="grid grid-cols-3 gap-3">
          {presetAmounts.map((preset) => (
            <button
              key={preset}
              onClick={() => { setSelectedAmount(preset); setCustomAmount("") }}
              className={cn(
                "p-4 rounded-xl border-2 text-center transition-all",
                selectedAmount === preset
                  ? "border-pitch-500 bg-pitch-50 text-pitch-700"
                  : "border-stadium-200 hover:border-pitch-300 text-stadium-700"
              )}
            >
              <p className="text-lg font-bold">{preset} crédits</p>
              <p className="text-xs text-stadium-500">pour {preset * pricePerCredit} €</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-stadium-700 mb-3">Ou montant personnalisé</h3>
        <div className="relative">
          <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stadium-400" />
          <input
            type="number"
            min="1"
            max="10000"
            placeholder="Nombre de crédits..."
            value={customAmount}
            onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null) }}
            className="w-full pl-10 pr-4 py-3 border-2 border-stadium-200 rounded-xl text-sm focus:border-pitch-500 focus:ring-2 focus:ring-pitch-100 outline-none transition-all"
          />
        </div>
      </div>

      {amount > 0 && (
        <Card className="border-2 border-pitch-200 bg-pitch-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stadium-600">Total à payer</p>
                <p className="text-2xl font-bold text-pitch-700">{amount * pricePerCredit} €</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-stadium-600">Crédits reçus</p>
                <p className="text-2xl font-bold text-pitch-700">{amount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleTopUp}
        disabled={amount < 1 || loading}
        className="w-full h-12 bg-gradient-to-r from-pitch-500 to-pitch-600 hover:from-pitch-600 hover:to-pitch-700 text-white font-bold text-base"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Recharger {amount > 0 ? `${amount} crédits` : ""}
          </>
        )}
      </Button>
    </div>
  )
}
