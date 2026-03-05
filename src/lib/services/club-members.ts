import { prisma } from "@/lib/prisma"
import type { ClubRole } from "@prisma/client"
import crypto from "crypto"

/** Normalise un email pour la comparaison d'invitation : même boîte Gmail avec/sans +alias. */
function emailsMatchForInvite(invitationEmail: string, loggedInEmail: string): boolean {
  const a = invitationEmail.trim().toLowerCase()
  const b = loggedInEmail.trim().toLowerCase()
  if (a === b) return true
  const gmailLike = (e: string) => /^[^@]+@(gmail|googlemail)\.com$/i.test(e)
  if (!gmailLike(a) || !gmailLike(b)) return false
  const local = (e: string) => e.split("@")[0].split("+")[0]
  const domain = (e: string) => e.split("@")[1]
  return local(a) === local(b) && domain(a) === domain(b)
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * List all ACTIVE + INVITED members for a club.
 */
export async function listMembers(clubProfileId: string) {
  return prisma.clubMember.findMany({
    where: {
      clubProfileId,
      status: { in: ["ACTIVE", "INVITED"] },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  })
}

/**
 * Get the ClubProfile for a user (via membership or legacy ClubProfile.userId).
 * Auto-creates OWNER membership if legacy owner has none.
 */
export async function getClubForUser(userId: string) {
  // 1. Check active membership
  const membership = await prisma.clubMember.findFirst({
    where: { userId, status: "ACTIVE" },
    select: { clubProfileId: true, role: true },
  })
  if (membership) return membership

  // 2. Fallback: legacy owner via ClubProfile.userId (ou via relation User -> clubProfile)
  let clubProfile: { id: string } | null = await prisma.clubProfile.findUnique({
    where: { userId },
    select: { id: true },
  })
  if (!clubProfile) {
    const userWithClub = await prisma.user.findUnique({
      where: { id: userId },
      select: { clubProfile: { select: { id: true } } },
    })
    clubProfile = userWithClub?.clubProfile ?? null
  }
  if (!clubProfile) return null

  // 3. Resolve user email for the membership record
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  })
  if (!user) return null

  // 4. Auto-create OWNER membership (idempotent upsert)
  const owner = await prisma.clubMember.upsert({
    where: { clubProfileId_email: { clubProfileId: clubProfile.id, email: user.email } },
    update: { userId, status: "ACTIVE", role: "OWNER" },
    create: {
      clubProfileId: clubProfile.id,
      userId,
      email: user.email,
      role: "OWNER",
      status: "ACTIVE",
      acceptedAt: new Date(),
    },
  })

  return { clubProfileId: owner.clubProfileId, role: owner.role }
}

// ─── Mutations ───────────────────────────────────────────────────────────────

/**
 * Create OWNER membership for a new club. Called during club creation.
 */
export async function createOwnerMembership(
  clubProfileId: string,
  userId: string,
  email: string
) {
  return prisma.clubMember.create({
    data: {
      clubProfileId,
      userId,
      email: email.trim().toLowerCase(),
      role: "OWNER",
      status: "ACTIVE",
      acceptedAt: new Date(),
    },
  })
}

/**
 * Invite a member by email. Returns the created membership with a token.
 */
export async function inviteMember(
  clubProfileId: string,
  email: string,
  role: ClubRole,
  invitedByUserId: string
) {
  const normalizedEmail = email.trim().toLowerCase()

  // Check for existing active or invited membership
  const existing = await prisma.clubMember.findUnique({
    where: { clubProfileId_email: { clubProfileId, email: normalizedEmail } },
  })
  if (existing && existing.status !== "REMOVED") {
    throw new Error(
      existing.status === "ACTIVE"
        ? "Cet utilisateur est déjà membre du club"
        : "Une invitation est déjà en attente pour cet email"
    )
  }

  const token = crypto.randomUUID()

  // If previously removed, reactivate as invited
  if (existing && existing.status === "REMOVED") {
    return prisma.clubMember.update({
      where: { id: existing.id },
      data: {
        role,
        status: "INVITED",
        inviteToken: token,
        invitedByUserId,
        removedAt: null,
        acceptedAt: null,
        userId: null,
      },
    })
  }

  // Check if user with this email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  return prisma.clubMember.create({
    data: {
      clubProfileId,
      userId: existingUser?.id ?? null,
      email: normalizedEmail,
      role,
      status: "INVITED",
      inviteToken: token,
      invitedByUserId,
    },
  })
}

/**
 * Regenerate invite token and return member for a pending invitation (so email can be resent).
 */
export async function resendInvitation(
  memberId: string,
  clubProfileId: string,
  invitedByUserId: string
) {
  const member = await prisma.clubMember.findUnique({
    where: { id: memberId },
  })
  if (!member || member.clubProfileId !== clubProfileId) {
    throw new Error("Membre non trouvé")
  }
  if (member.status !== "INVITED") {
    throw new Error("Cette invitation n'est plus en attente")
  }

  const token = crypto.randomUUID()
  return prisma.clubMember.update({
    where: { id: memberId },
    data: { inviteToken: token, invitedByUserId },
  })
}

/**
 * Accept an invitation by token.
 */
export async function acceptInvite(token: string, userId: string, userEmail: string) {
  const member = await prisma.clubMember.findUnique({
    where: { inviteToken: token },
  })

  if (!member) {
    throw new Error("Invitation non trouvée ou déjà utilisée. Demandez une nouvelle invitation au club.")
  }
  if (member.status !== "INVITED") {
    throw new Error("Cette invitation n'est plus valide.")
  }
  if (!emailsMatchForInvite(member.email, userEmail)) {
    throw new Error("Cette invitation a été envoyée à un autre email. Connectez-vous avec le compte invité.")
  }

  // L'utilisateur est déjà membre actif du club (ex. même personne, autre email) → invalider la ligne invitée et retourner le membership existant
  const existingActive = await prisma.clubMember.findUnique({
    where: {
      clubProfileId_userId: { clubProfileId: member.clubProfileId, userId },
    },
  })
  if (existingActive && existingActive.status === "ACTIVE") {
    await prisma.clubMember.update({
      where: { id: member.id },
      data: { inviteToken: null, status: "REMOVED", removedAt: new Date() },
    })
    return existingActive
  }

  return prisma.clubMember.update({
    where: { id: member.id },
    data: {
      userId,
      status: "ACTIVE",
      acceptedAt: new Date(),
      inviteToken: null,
    },
  })
}

/**
 * Remove a member. Prevents removing the last OWNER.
 */
export async function removeMember(
  clubProfileId: string,
  memberId: string
) {
  const member = await prisma.clubMember.findUnique({ where: { id: memberId } })
  if (!member || member.clubProfileId !== clubProfileId) {
    throw new Error("Membre non trouvé")
  }

  if (member.role === "OWNER") {
    const ownerCount = await prisma.clubMember.count({
      where: { clubProfileId, role: "OWNER", status: "ACTIVE" },
    })
    if (ownerCount <= 1) {
      throw new Error("Impossible de retirer le dernier propriétaire du club")
    }
  }

  return prisma.clubMember.update({
    where: { id: memberId },
    data: { status: "REMOVED", removedAt: new Date(), inviteToken: null },
  })
}

/**
 * Change a member's role. Cannot change to/from OWNER via this function.
 */
export async function changeRole(
  clubProfileId: string,
  memberId: string,
  newRole: ClubRole
) {
  if (newRole === "OWNER") throw new Error("Utilisez le transfert de propriété")

  const member = await prisma.clubMember.findUnique({ where: { id: memberId } })
  if (!member || member.clubProfileId !== clubProfileId) {
    throw new Error("Membre non trouvé")
  }
  if (member.role === "OWNER") {
    throw new Error("Impossible de modifier le rôle du propriétaire")
  }
  if (member.status !== "ACTIVE" && member.status !== "INVITED") {
    throw new Error("Ce membre n'est plus actif")
  }

  return prisma.clubMember.update({
    where: { id: memberId },
    data: { role: newRole },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  })
}

/**
 * Transfer ownership atomically: current owner → ADMIN, target → OWNER.
 */
export async function transferOwnership(
  clubProfileId: string,
  fromUserId: string,
  toMemberId: string
) {
  const [currentOwner, targetMember] = await Promise.all([
    prisma.clubMember.findFirst({
      where: { clubProfileId, userId: fromUserId, role: "OWNER", status: "ACTIVE" },
    }),
    prisma.clubMember.findUnique({ where: { id: toMemberId } }),
  ])

  if (!currentOwner) throw new Error("Vous n'êtes pas propriétaire de ce club")
  if (!targetMember || targetMember.clubProfileId !== clubProfileId) {
    throw new Error("Membre cible non trouvé")
  }
  if (targetMember.status !== "ACTIVE") {
    throw new Error("Le membre cible doit être actif")
  }

  return prisma.$transaction([
    prisma.clubMember.update({
      where: { id: currentOwner.id },
      data: { role: "ADMIN" },
    }),
    prisma.clubMember.update({
      where: { id: targetMember.id },
      data: { role: "OWNER" },
    }),
  ])
}
