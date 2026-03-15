"use client"

import { AdminHeader } from "@/components/admin/AdminHeader"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  AlertTriangle,
} from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div>
      <AdminHeader
        title="Paramètres"
        description="Configuration de la plateforme"
      />

      <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
        {/* General Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Settings className="h-5 w-5" />
            Général
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Mode maintenance</Label>
                <p className="text-sm text-slate-500">
                  Désactive l'accès à la plateforme pour les non-admins
                </p>
              </div>
              <Switch disabled />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Inscriptions ouvertes</Label>
                <p className="text-sm text-slate-500">
                  Autorise les nouvelles inscriptions
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5" />
            Notifications admin
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Nouvel utilisateur</Label>
                <p className="text-sm text-slate-500">
                  Recevoir un email pour chaque inscription
                </p>
              </div>
              <Switch disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Demande de vérification</Label>
                <p className="text-sm text-slate-500">
                  Notification quand un agent/club demande vérification
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Signalement de contenu</Label>
                <p className="text-sm text-slate-500">
                  Alerte pour les contenus signalés
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5" />
            Sécurité
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Limite actions AI</Label>
                <p className="text-sm text-slate-500">
                  Nombre max d'actions AI par heure par utilisateur
                </p>
              </div>
              <Input
                type="number"
                defaultValue={20}
                className="w-20"
                disabled
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Validation 2 étapes AI</Label>
                <p className="text-sm text-slate-500">
                  Confirmation requise avant exécution des actions AI
                </p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </div>
        </Card>

        {/* Database */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
            <Database className="h-5 w-5" />
            Base de données
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Statut</span>
                <span className="text-sm text-emerald-600 font-medium">Connecté</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">Provider</span>
                <span className="text-sm text-slate-600">PostgreSQL (Neon)</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full" disabled>
              Exporter les données
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5" />
            Zone dangereuse
          </h3>
          
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Ces actions sont irréversibles. Procédez avec prudence.
            </p>
            
            <div className="flex gap-3">
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled>
                Purger le cache
              </Button>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" disabled>
                Reset audit logs
              </Button>
            </div>
          </div>
        </Card>

        {/* Info notice */}
        <p className="text-sm text-slate-500 text-center">
          Les paramètres sont actuellement en lecture seule. Contactez l'équipe technique pour les modifications.
        </p>
      </div>
    </div>
  )
}
