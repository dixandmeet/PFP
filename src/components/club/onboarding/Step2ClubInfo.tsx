"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Combobox } from "@/components/ui/combobox"
import {
  clubInfoSchema,
  type ClubInfoFormData,
} from "@/lib/validators/club-onboarding-schemas"
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  Building2,
  Scale,
  Mail,
  Trophy,
  GraduationCap,
  Users,
} from "lucide-react"
import { useState, type ReactNode } from "react"
import { COUNTRIES, getCountryIsoCode } from "@/lib/constants/countries"
import { AddressAutocomplete } from "@/components/ui/address-autocomplete"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface Step2Props {
  defaultValues?: Partial<ClubInfoFormData>
  clubId?: string | null
  onSaved: (clubId: string) => void
  onBack: () => void
}

const CLUB_TYPES = [
  { value: "PRO" as const, label: "Professionnel", icon: Trophy },
  { value: "AMATEUR" as const, label: "Amateur", icon: Users },
  { value: "ACADEMY" as const, label: "Centre de formation", icon: GraduationCap },
]

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-red-600 mt-1.5">{message}</p>
}

function FormSection({
  icon: Icon,
  title,
  description,
  optional,
  children,
}: {
  icon: LucideIcon
  title: string
  description?: string
  optional?: boolean
  children: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-stadium-200/90 bg-white p-5 md:p-6 shadow-sm space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pitch-500 to-pitch-600 text-white shadow-sm">
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-stadium-900">{title}</h3>
            {optional && (
              <span className="inline-flex items-center rounded-full bg-stadium-100 px-2.5 py-0.5 text-xs font-medium text-stadium-600">
                Optionnel
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-stadium-500 mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {children}
    </section>
  )
}

function FieldGroup({
  id,
  label,
  required,
  error,
  children,
  className,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label htmlFor={id} className="text-stadium-700 font-medium">
        {label}
        {required && <span className="text-pitch-600 ml-0.5">*</span>}
      </Label>
      <div className="mt-1.5">{children}</div>
      <FieldError message={error} />
    </div>
  )
}

const inputClassName =
  "h-11 border-stadium-200 bg-stadium-50/50 focus-visible:ring-pitch-500/30 focus-visible:border-pitch-400"

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

  const selectedClubType = form.watch("clubType")
  const selectedCountry = form.watch("country")
  const countryIso = getCountryIsoCode(selectedCountry || "")
  const { errors } = form.formState

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
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-stadium-900 tracking-tight">
          Informations du club
        </h2>
        <p className="text-sm text-stadium-500 leading-relaxed">
          Renseignez l&apos;identité et les coordonnées de votre club. Les informations
          légales peuvent être complétées plus tard.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormSection
          icon={Building2}
          title="Identité du club"
          description="Nom, localisation et type de structure"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <FieldGroup
              id="clubName"
              label="Nom officiel du club"
              required
              error={errors.clubName?.message}
              className="md:col-span-2"
            >
              <Input
                id="clubName"
                {...form.register("clubName")}
                placeholder="FC Exemple"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup
              id="country"
              label="Pays"
              required
              error={errors.country?.message}
            >
              <Combobox
                options={COUNTRIES}
                value={form.watch("country")}
                onValueChange={(val) => {
                  form.setValue("country", val, { shouldValidate: true })
                }}
                placeholder="Sélectionner un pays"
                searchPlaceholder="Rechercher un pays…"
                emptyText="Aucun pays trouvé"
                buttonClassName="h-11 border-stadium-200 bg-stadium-50/50"
              />
            </FieldGroup>

            <FieldGroup id="city" label="Ville" required error={errors.city?.message}>
              <Input
                id="city"
                {...form.register("city")}
                placeholder="Paris"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup
              id="yearFounded"
              label="Année de fondation"
              required
              error={errors.yearFounded?.message}
            >
              <Input
                id="yearFounded"
                type="number"
                {...form.register("yearFounded", { valueAsNumber: true })}
                placeholder="1920"
                className={inputClassName}
              />
            </FieldGroup>

            <div className="md:col-span-2">
              <Label className="text-stadium-700 font-medium">
                Type de club<span className="text-pitch-600 ml-0.5">*</span>
              </Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CLUB_TYPES.map((t) => {
                  const Icon = t.icon
                  const selected = selectedClubType === t.value
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        form.setValue("clubType", t.value, {
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border-2 px-4 py-4 text-center transition-all",
                        selected
                          ? "border-pitch-500 bg-pitch-50 shadow-sm"
                          : "border-stadium-200 bg-stadium-50/30 hover:border-stadium-300 hover:bg-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-6 w-6",
                          selected ? "text-pitch-600" : "text-stadium-400"
                        )}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          "text-sm font-medium",
                          selected ? "text-pitch-800" : "text-stadium-700"
                        )}
                      >
                        {t.label}
                      </span>
                    </button>
                  )
                })}
              </div>
              <FieldError message={errors.clubType?.message} />
            </div>
          </div>
        </FormSection>

        <FormSection
          icon={Scale}
          title="Informations légales"
          description="Forme juridique, immatriculation et affiliation fédérale"
          optional
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <FieldGroup id="legalForm" label="Forme juridique" error={errors.legalForm?.message}>
              <Input
                id="legalForm"
                {...form.register("legalForm")}
                placeholder="Association loi 1901, SASP…"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup
              id="registrationNumber"
              label="N° SIRET / RNA"
              error={errors.registrationNumber?.message}
            >
              <Input
                id="registrationNumber"
                {...form.register("registrationNumber")}
                placeholder="123 456 789 00012"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup id="federation" label="Fédération">
              <Input
                id="federation"
                {...form.register("federation")}
                placeholder="FFF, FIFA…"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup id="federationNumber" label="N° d'affiliation">
              <Input
                id="federationNumber"
                {...form.register("federationNumber")}
                placeholder="123456"
                className={inputClassName}
              />
            </FieldGroup>
          </div>
        </FormSection>

        <FormSection
          icon={Mail}
          title="Contact officiel"
          description="Coordonnées utilisées pour les échanges avec Profoot Profile"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <FieldGroup
              id="officialEmail"
              label="Email officiel"
              required
              error={errors.officialEmail?.message}
            >
              <Input
                id="officialEmail"
                type="email"
                {...form.register("officialEmail")}
                placeholder="contact@club.com"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup
              id="officialPhone"
              label="Téléphone officiel"
              required
              error={errors.officialPhone?.message}
            >
              <Input
                id="officialPhone"
                type="tel"
                {...form.register("officialPhone")}
                placeholder="+33 1 23 45 67 89"
                className={inputClassName}
              />
            </FieldGroup>

            <FieldGroup
              id="address"
              label="Adresse complète"
              required
              error={errors.address?.message}
              className="md:col-span-2"
            >
              <Controller
                name="address"
                control={form.control}
                render={({ field }) => (
                  <AddressAutocomplete
                    id="address"
                    value={field.value}
                    onValueChange={field.onChange}
                    countryRestriction={countryIso}
                    placeholder="Commencez à saisir votre adresse…"
                    className={inputClassName}
                  />
                )}
              />
              {!selectedCountry && (
                <p className="text-xs text-stadium-500 mt-1.5">
                  Sélectionnez un pays pour affiner les suggestions d&apos;adresse.
                </p>
              )}
            </FieldGroup>
          </div>
        </FormSection>

        {serverError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700">{serverError}</p>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="border-stadium-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-pitch-600 hover:bg-pitch-700 h-11"
          >
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
