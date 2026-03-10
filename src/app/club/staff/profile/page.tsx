"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useMemo, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserCircle, Briefcase, Award } from "lucide-react"
import { StaffProfileSectionInfo } from "./StaffProfileSectionInfo"
import { StaffProfileSectionExperience } from "./StaffProfileSectionExperience"
import { StaffProfileSectionSkills } from "./StaffProfileSectionSkills"

const SECTIONS = ["info", "experience", "skills"] as const
type Section = (typeof SECTIONS)[number]

function isValidSection(s: string | null): s is Section {
  return s !== null && SECTIONS.includes(s as Section)
}

export default function StaffProfilePage() {
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
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon profil staff</h1>
        <p className="text-gray-500 mt-1">
          Vos informations personnelles, expérience et compétences en tant que membre du staff du club.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto p-1 rounded-xl bg-stadium-100 mb-6">
          <TabsTrigger
            value="info"
            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-pitch-600 data-[state=active]:shadow-sm"
          >
            <UserCircle className="h-4 w-4" />
            Informations
          </TabsTrigger>
          <TabsTrigger
            value="experience"
            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-pitch-600 data-[state=active]:shadow-sm"
          >
            <Briefcase className="h-4 w-4" />
            Expérience
          </TabsTrigger>
          <TabsTrigger
            value="skills"
            className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-pitch-600 data-[state=active]:shadow-sm"
          >
            <Award className="h-4 w-4" />
            Compétences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-0">
          <StaffProfileSectionInfo />
        </TabsContent>
        <TabsContent value="experience" className="mt-0">
          <StaffProfileSectionExperience />
        </TabsContent>
        <TabsContent value="skills" className="mt-0">
          <StaffProfileSectionSkills />
        </TabsContent>
      </Tabs>
    </div>
  )
}
