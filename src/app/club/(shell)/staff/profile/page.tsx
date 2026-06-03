"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCircle, Briefcase, Award } from "lucide-react"
import { StaffProfileSectionInfo } from "./StaffProfileSectionInfo"
import { StaffProfileSectionExperience } from "./StaffProfileSectionExperience"
import { StaffProfileSectionSkills } from "./StaffProfileSectionSkills"
import { StaffProfileAccountLinks } from "./StaffProfileAccountLinks"
import { cn } from "@/lib/utils"

const SECTIONS = ["info", "experience", "skills"] as const
type Section = (typeof SECTIONS)[number]

function isValidSection(s: string | null): s is Section {
  return s !== null && SECTIONS.includes(s as Section)
}

const TAB_CONFIG = [
  { value: "info", label: "Informations", icon: UserCircle, description: "Identité et contact" },
  { value: "experience", label: "Expérience", icon: Briefcase, description: "Parcours professionnel" },
  { value: "skills", label: "Compétences", icon: Award, description: "Expertises et spécialités" },
] as const

export default function StaffProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl px-4 py-8 animate-pulse">
          <div className="mb-6 h-8 w-48 rounded-lg bg-stadium-100" />
          <div className="h-64 rounded-2xl bg-stadium-100" />
        </div>
      }
    >
      <StaffProfileContent />
    </Suspense>
  )
}

function StaffProfileContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sectionParam = searchParams.get("section")
  const activeTab = useMemo(() => {
    if (isValidSection(sectionParam)) return sectionParam
    return "info"
  }, [sectionParam])

  const onTabChange = useCallback(
    (value: string) => {
      if (value === "info") {
        router.replace("/club/staff/profile", { scroll: false })
      } else {
        router.replace(`/club/staff/profile?section=${value}`, { scroll: false })
      }
    },
    [router]
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 lg:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stadium-900">Mon profil</h1>
        <p className="mt-1 text-sm text-stadium-500">
          Vos informations personnelles, expérience et compétences en tant que membre du staff du club.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_260px] lg:gap-8">
        <div className="min-w-0">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="mb-4 flex h-auto w-full flex-col gap-1 rounded-2xl border border-stadium-200 bg-white p-1.5 shadow-sm sm:flex-row sm:gap-0">
              {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    "text-stadium-500 hover:text-stadium-700",
                    "data-[state=active]:bg-pitch-50 data-[state=active]:text-pitch-700 data-[state=active]:shadow-none data-[state=active]:ring-1 data-[state=active]:ring-pitch-200"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{label.split(" ")[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="rounded-2xl border border-stadium-200 bg-white p-5 shadow-sm sm:p-6">
              {TAB_CONFIG.map(({ value, label, description }) => (
                <TabsContent key={value} value={value} className="mt-0 focus-visible:outline-none">
                  <div className="mb-6 border-b border-stadium-100 pb-4">
                    <h2 className="text-lg font-semibold text-stadium-900">{label}</h2>
                    <p className="mt-0.5 text-sm text-stadium-500">{description}</p>
                  </div>

                  {value === "info" && <StaffProfileSectionInfo />}
                  {value === "experience" && <StaffProfileSectionExperience />}
                  {value === "skills" && <StaffProfileSectionSkills />}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <StaffProfileAccountLinks />
          </div>
        </aside>
      </div>

      <div className="mt-6 lg:hidden">
        <StaffProfileAccountLinks />
      </div>
    </div>
  )
}
