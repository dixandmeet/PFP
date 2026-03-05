"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import {
  clubInfoSchema,
  type ClubInfoFormData,
} from "@/lib/validators/club-onboarding-schemas"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { useState } from "react"
import { COUNTRIES } from "@/lib/constants/countries"

interface Step2Props {
  defaultValues?: Partial<ClubInfoFormData>
  clubId?: string | null
  onSaved: (clubId: string) => void
  onBack: () => void
}

const CLUB_TYPES = [
  { value: "PRO", label: "Club professionnel" },
  { value: "AMATEUR", label: "Club amateur" },
  { value: "ACADEMY", label: "Centre de formation" },
] as const

export function Step2ClubInfo({ defaultValues, clubId, onSaved, onBack }: Step2Props) {
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState("")

  const form = useForm<ClubInfoFormData>({
    resolver: zodResolver(clubInfoSchema),
    defaultValues: {
      clubName: "",
      country: "",
      city: "",
      yearFounded: undefined,
      clubType: undefined,
      legalForm: "",
      registrationNumber: "",
      federation: "",
      federationNumber: "",
      officialEmail: "",
      officialPhone: "",
      address: "",
      ...defaultValues,
    },
  })

  const watchCountry = form.watch("country")
  const isFrance =
    watchCountry?.toUpperCase() === "FR" ||
    watchCountry?.toLowerCase() === "france"

  const onSubmit = async (data: ClubInfoFormData) => {
    setSaving(true)
    setServerError("")

    try {
      const url = clubId
        ? `/api/onboarding/club/${clubId}`
        : "/api/onboarding/club"
      const method = clubId ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        if (json.details) {
          // Mapper les erreurs serveur vers les champs du formulaire
          Object.entries(json.details).forEach(([field, messages]) => {
            form.setError(field as keyof ClubInfoFormData, {
              message: Array.isArray(messages) ? messages[0] : String(messages),
            })
          })
        }
        setServerError(json.error || "Erreur lors de la sauvegarde")
        return
      }

      onSaved(json.club.id)
    } catch {
      setServerError("Erreur de connexion au serveur")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Informations du club
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Renseignez les informations légales et de contact de votre club.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Identité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="clubName">Nom officiel du club *</Label>
            <Input
              id="clubName"
              {...form.register("clubName")}
              placeholder="FC Exemple"
              className="mt-1"
            />
            {form.formState.errors.clubName && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.clubName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="country">Pays *</Label>
            <Combobox
              options={COUNTRIES}
              value={form.watch("country")}
              onValueChange={(val) => {
                form.setValue("country", val, { shouldValidate: true })
                // Reset city when country changes
                if (val !== form.getValues("country")) {
                  form.setValue("city", "")
                }
              }}
              placeholder="Sélectionner un pays"
              searchPlaceholder="Rechercher un pays…"
              emptyText="Aucun pays trouvé"
              buttonClassName="mt-1"
            />
            {form.formState.errors.country && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.country.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              {...form.register("city")}
              placeholder="Paris"
              className="mt-1"
            />
            {form.formState.errors.city && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.city.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="yearFounded">Année de fondation *</Label>
            <Input
              id="yearFounded"
              type="number"
              {...form.register("yearFounded", { valueAsNumber: true })}
              placeholder="1920"
              className="mt-1"
            />
            {form.formState.errors.yearFounded && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.yearFounded.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="clubType">Type de club *</Label>
            <select
              id="clubType"
              {...form.register("clubType")}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">Sélectionner...</option>
              {CLUB_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            {form.formState.errors.clubType && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.clubType.message}
              </p>
            )}
          </div>
        </div>

        {/* Informations légales */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">
            Informations légales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="legalForm">Forme juridique *</Label>
              <Input
                id="legalForm"
                {...form.register("legalForm")}
                placeholder="Association loi 1901, SASP..."
                className="mt-1"
              />
              {form.formState.errors.legalForm && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.legalForm.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="registrationNumber">
                N° SIRET/RNA {isFrance ? "*" : "(optionnel)"}
              </Label>
              <Input
                id="registrationNumber"
                {...form.register("registrationNumber")}
                placeholder="123 456 789 00012"
                className="mt-1"
              />
              {form.formState.errors.registrationNumber && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.registrationNumber.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="federation">Fédération (optionnel)</Label>
              <Input
                id="federation"
                {...form.register("federation")}
                placeholder="FFF, FIFA..."
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="federationNumber">
                N° d&apos;affiliation (optionnel)
              </Label>
              <Input
                id="federationNumber"
                {...form.register("federationNumber")}
                placeholder="123456"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="officialEmail">Email officiel *</Label>
              <Input
                id="officialEmail"
                type="email"
                {...form.register("officialEmail")}
                placeholder="contact@club.com"
                className="mt-1"
              />
              {form.formState.errors.officialEmail && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.officialEmail.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="officialPhone">Téléphone officiel *</Label>
              <Input
                id="officialPhone"
                type="tel"
                {...form.register("officialPhone")}
                placeholder="+33 1 23 45 67 89"
                className="mt-1"
              />
              {form.formState.errors.officialPhone && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.officialPhone.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address">Adresse complète *</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="123 Rue du Stade, 75001 Paris"
                className="mt-1"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="w-4 h-4 mr-2" />
            )}
            Enregistrer et continuer
          </Button>
        </div>
      </form>
    </div>
  )
}
