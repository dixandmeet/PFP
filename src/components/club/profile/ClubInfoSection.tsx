"use client"

import { useCallback } from "react"
import type { UseFormRegister, UseFormSetValue, UseFormWatch, FieldErrors } from "react-hook-form"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { COUNTRIES } from "@/lib/constants/countries"
import type { ClubProfileFormValues } from "@/lib/validators/schemas"
import { Trophy, Users, GraduationCap, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ClubInfoSectionProps {
  register: UseFormRegister<ClubProfileFormValues>
  setValue: UseFormSetValue<ClubProfileFormValues>
  watch: UseFormWatch<ClubProfileFormValues>
  errors: FieldErrors<ClubProfileFormValues>
}

const BIO_MIN_CHARS = 50

export function ClubInfoSection({
  register,
  setValue,
  watch,
  errors,
}: ClubInfoSectionProps) {
  const countryValue = watch("country")
  const clubTypeValue = watch("clubType")
  const bioValue = watch("bio") || ""
  const bioLength = bioValue.length
  const bioMeetsMinimum = bioLength >= BIO_MIN_CHARS

  const handleClubTypeChange = useCallback(
    (value: ClubProfileFormValues["clubType"]) => {
      setValue("clubType", value, { shouldDirty: true, shouldValidate: true })
    },
    [setValue]
  )

  const handleCountryChange = useCallback(
    (value: string) => {
      setValue("country", value, { shouldDirty: true, shouldValidate: true })
    },
    [setValue]
  )

  // Auto-préfixe https:// sur le champ website au blur
  const handleWebsiteBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const val = e.target.value.trim()
      if (val && !/^https?:\/\//i.test(val)) {
        setValue("website", `https://${val}`, {
          shouldDirty: true,
          shouldValidate: true,
        })
      }
    },
    [setValue]
  )

  return (
    <>
      {/* Informations du club */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Informations du club</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Nom du club * */}
            <div className="space-y-1.5">
              <Label htmlFor="clubName">
                Nom du club <span className="text-red-500">*</span>
              </Label>
              <Input
                id="clubName"
                placeholder="Ex : FC Bordeaux"
                aria-invalid={!!errors.clubName}
                {...register("clubName")}
              />
              <p className="text-xs text-stadium-500">
                Nom officiel complet du club
              </p>
              {errors.clubName && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.clubName.message}
                </p>
              )}
            </div>

            {/* Nom court */}
            <div className="space-y-1.5">
              <Label htmlFor="shortName">Nom court</Label>
              <Input
                id="shortName"
                placeholder="Ex : FCB"
                {...register("shortName")}
              />
              <p className="text-xs text-stadium-500">
                Abréviation ou sigle (3-5 lettres)
              </p>
            </div>

            {/* Type de club */}
            <div className="space-y-2 md:col-span-2">
              <Label>Type de structure</Label>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "PRO" as const, label: "Club pro", desc: "Club professionnel", icon: Trophy },
                  { value: "AMATEUR" as const, label: "Club amateur", desc: "Club amateur / semi-pro", icon: Users },
                  { value: "ACADEMY" as const, label: "Centre de formation", desc: "Académie / formation", icon: GraduationCap },
                ]).map(({ value, label, desc, icon: Icon }) => {
                  const isSelected = clubTypeValue === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleClubTypeChange(value)}
                      className={`
                        relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-center transition-all duration-200
                        focus:outline-none focus:ring-2 focus:ring-pitch-500 focus:ring-offset-2
                        ${isSelected
                          ? "border-pitch-500 bg-pitch-50 shadow-sm"
                          : "border-stadium-200 bg-white hover:border-stadium-300 hover:bg-stadium-50"
                        }
                      `}
                      aria-pressed={isSelected}
                    >
                      <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${isSelected ? "bg-pitch-100 text-pitch-700" : "bg-stadium-100 text-stadium-500"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`text-sm font-medium ${isSelected ? "text-pitch-800" : "text-stadium-700"}`}>
                        {label}
                      </span>
                      <span className="text-[11px] text-stadium-400 leading-tight">
                        {desc}
                      </span>
                    </button>
                  )
                })}
              </div>
              {errors.clubType && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.clubType.message}
                </p>
              )}
            </div>

            {/* Pays * (Combobox searchable) */}
            <div className="space-y-1.5">
              <Label htmlFor="country-combobox">
                Pays <span className="text-red-500">*</span>
              </Label>
              <Combobox
                options={COUNTRIES}
                value={countryValue}
                onValueChange={handleCountryChange}
                placeholder="Sélectionner un pays"
                searchPlaceholder="Rechercher un pays…"
                emptyText="Aucun pays trouvé"
              />
              {errors.country && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.country.message}
                </p>
              )}
            </div>

            {/* Ville */}
            <div className="space-y-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                placeholder="Ex : Bordeaux"
                {...register("city")}
              />
              <p className="text-xs text-stadium-500">
                Ville du siège ou du stade principal
              </p>
            </div>

            {/* Année de fondation */}
            <div className="space-y-1.5">
              <Label htmlFor="foundedYear">Année de fondation</Label>
              <Input
                id="foundedYear"
                type="number"
                placeholder="Ex : 1902"
                min={1800}
                max={new Date().getFullYear()}
                aria-invalid={!!errors.foundedYear}
                {...register("foundedYear", { valueAsNumber: true })}
              />
              <p className="text-xs text-stadium-500">
                Entre 1800 et {new Date().getFullYear()}
              </p>
              {errors.foundedYear && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.foundedYear.message}
                </p>
              )}
            </div>

            {/* Site web */}
            <div className="space-y-1.5">
              <Label htmlFor="website">Site web</Label>
              <Input
                id="website"
                placeholder="Ex : www.monclub.fr"
                aria-invalid={!!errors.website}
                {...register("website", {
                  onBlur: handleWebsiteBlur,
                })}
              />
              <p className="text-xs text-stadium-500">
                Le préfixe https:// sera ajouté automatiquement
              </p>
              {errors.website && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description / Bio */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Textarea
            id="bio"
            rows={5}
            placeholder="Parlez de l'histoire du club, ses valeurs, son projet sportif…"
            className={cn(
              bioLength > 0 && bioMeetsMinimum && "border-pitch-300 bg-pitch-50/30"
            )}
            {...register("bio")}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-stadium-500">
              Présentez votre club aux joueurs et agents
            </p>
            <div className="flex items-center gap-1.5">
              {bioLength > 0 && bioMeetsMinimum && (
                <CheckCircle2 className="h-3.5 w-3.5 text-pitch-500" />
              )}
              <span
                className={cn(
                  "text-xs font-medium",
                  bioLength === 0
                    ? "text-stadium-400"
                    : bioMeetsMinimum
                      ? "text-pitch-600"
                      : "text-amber-600"
                )}
              >
                {bioLength}/{BIO_MIN_CHARS} car. min.
              </span>
            </div>
          </div>
          {bioLength > 0 && !bioMeetsMinimum && (
            <p className="text-xs text-amber-600">
              Encore {BIO_MIN_CHARS - bioLength} caractère{BIO_MIN_CHARS - bioLength > 1 ? "s" : ""} pour valider la complétion du profil
            </p>
          )}
        </CardContent>
      </Card>
    </>
  )
}
