import { prisma } from "@/lib/prisma"
import { acceptInvite, emailsMatchForInvite } from "@/lib/services/club-members"

export type StaffOnboardingStepKey = "PROFILE" | "KYC" | "INVITE" | "DONE"

const IDENTITY_KYC_TYPES = ["IDENTITY_CARD", "PASSPORT", "DRIVING_LICENSE"] as const

export interface PendingStaffInvite {
  memberId: string
  token: string
  clubName: string
  role: string
}

export interface StaffOnboardingState {
  step: StaffOnboardingStepKey
  clubName: string | null
  clubRole: string | null
  staffProfile: {
    firstName?: string | null
    lastName?: string | null
    jobTitle?: string | null
    bio?: string | null
    phone?: string | null
  } | null
  kycDocuments: Array<{
    id: string
    type: string
    fileName: string
    fileSize: number | null
    createdAt: Date
  }>
  pendingInvites: PendingStaffInvite[]
}

function hasCompleteStaffProfile(profile: {
  firstName?: string | null
  lastName?: string | null
} | null): boolean {
  return !!(profile?.firstName?.trim() && profile?.lastName?.trim())
}

function hasIdentityKyc(
  docs: Array<{ type: string }>
): boolean {
  return docs.some((d) =>
    (IDENTITY_KYC_TYPES as readonly string[]).includes(d.type)
  )
}

export function resolveStaffOnboardingStep(input: {
  staffProfile: { firstName?: string | null; lastName?: string | null } | null
  kycDocuments: Array<{ type: string }>
  activeMember: { staffOnboardingStep: string | null } | null
}): StaffOnboardingStepKey {
  const { staffProfile, kycDocuments, activeMember } = input

  if (activeMember?.staffOnboardingStep === "DONE") {
    return "DONE"
  }

  if (!hasCompleteStaffProfile(staffProfile)) {
    return "PROFILE"
  }

  if (!hasIdentityKyc(kycDocuments)) {
    return "KYC"
  }

  if (!activeMember) {
    return "INVITE"
  }

  return "DONE"
}

export async function getPendingInvitesForUser(
  userEmail: string
): Promise<PendingStaffInvite[]> {
  const invited = await prisma.clubMember.findMany({
    where: {
      status: "INVITED",
      inviteToken: { not: null },
    },
    select: {
      id: true,
      email: true,
      role: true,
      inviteToken: true,
      clubProfile: { select: { clubName: true } },
    },
  })

  return invited
    .filter((m) => emailsMatchForInvite(m.email, userEmail) && m.inviteToken)
    .map((m) => ({
      memberId: m.id,
      token: m.inviteToken!,
      clubName: m.clubProfile.clubName,
      role: m.role,
    }))
}

export async function getStaffOnboardingState(
  userId: string
): Promise<StaffOnboardingState> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      clubStaffProfile: true,
    },
  })

  if (!user?.email) {
    throw new Error("Utilisateur introuvable")
  }

  const [kycDocuments, activeMember, pendingInvites] = await Promise.all([
    prisma.kycDocument.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clubMember.findFirst({
      where: { userId, status: "ACTIVE" },
      select: {
        id: true,
        role: true,
        staffOnboardingStep: true,
        clubProfile: { select: { clubName: true } },
      },
    }),
    getPendingInvitesForUser(user.email),
  ])

  const step = resolveStaffOnboardingStep({
    staffProfile: user.clubStaffProfile,
    kycDocuments,
    activeMember,
  })

  return {
    step,
    clubName: activeMember?.clubProfile.clubName ?? null,
    clubRole: activeMember?.role ?? null,
    staffProfile: user.clubStaffProfile,
    kycDocuments: kycDocuments.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      fileSize: d.fileSize,
      createdAt: d.createdAt,
    })),
    pendingInvites,
  }
}

export async function computeStaffOnboardingStepAfterInvite(
  userId: string
): Promise<"PROFILE" | "KYC" | "DONE"> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      clubStaffProfile: true,
      kycDocuments: { select: { type: true } },
    },
  })

  if (!hasCompleteStaffProfile(user?.clubStaffProfile ?? null)) {
    return "PROFILE"
  }
  if (!hasIdentityKyc(user?.kycDocuments ?? [])) {
    return "KYC"
  }
  return "DONE"
}

export async function acceptInviteDuringOnboarding(
  userId: string,
  userEmail: string,
  token: string
) {
  const member = await acceptInvite(token, userId, userEmail)
  const nextStep = await computeStaffOnboardingStepAfterInvite(userId)

  await prisma.clubMember.update({
    where: { id: member.id },
    data: { staffOnboardingStep: nextStep },
  })

  const club = await prisma.clubProfile.findUnique({
    where: { id: member.clubProfileId },
    select: { clubName: true },
  })

  return {
    step: nextStep === "DONE" ? ("DONE" as const) : nextStep,
    clubName: club?.clubName ?? "Club",
    clubProfileId: member.clubProfileId,
    role: member.role,
  }
}
