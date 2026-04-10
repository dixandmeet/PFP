// Auth.js v5 configuration
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { CredentialsSignin } from "@auth/core/errors"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { sendEmail, emailTemplates } from "./email"
import { getBaseUrl } from "./url"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

/** Jeté dans authorize() si le mot de passe est bon mais l’email n’est pas vérifié. */
class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified"
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      role: Role
      name?: string | null
      image?: string | null
      isNewUser?: boolean
    }
  }

  interface User {
    role?: Role
    isNewUser?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
    isNewUser?: boolean
  }
}

// Config brut exporté pour les endpoints mobile (token generation)
export const authConfig: NextAuthConfig = {
  // Requis sur Vercel / reverse proxy (Host, URL canonique, cookies)
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Account linking is handled manually in signIn callback below
      // to prevent account takeover via unverified emails.
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = (credentials.email as string).toLowerCase()
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        if (!user.emailVerified) {
          throw new EmailNotVerifiedError()
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 14 * 24 * 60 * 60, // 14 jours
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // Lors de la première connexion
      if (user) {
        token.id = user.id!
        // Récupérer le rôle depuis la base de données
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id! },
          select: { role: true, createdAt: true },
        })
        token.role = dbUser?.role || "PLAYER"

        // Détecter un nouvel utilisateur via la présence de account + date de création récente
        if (account && dbUser) {
          const isNew = Date.now() - dbUser.createdAt.getTime() < 10000
          if (isNew) {
            token.isNewUser = true
          }
        }
      }

      // Permettre la mise à jour via update session
      if (trigger === "update") {
        if (session?.role) {
          token.role = session.role
        }
        if (session?.isNewUser !== undefined) {
          token.isNewUser = session.isNewUser
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isNewUser = token.isNewUser
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Si c'est une URL relative, la combiner avec baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Si l'URL est sur le même domaine, l'utiliser
      if (url.startsWith(baseUrl)) {
        return url
      }
      // Par défaut, rediriger vers la page welcome
      return `${baseUrl}/welcome`
    },
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, emailVerified: true },
        })

        if (existingUser) {
          // Check if a Google account is already linked
          const linkedAccount = await prisma.account.findFirst({
            where: { userId: existingUser.id, provider: "google" },
          })

          if (!linkedAccount) {
            // Only allow auto-linking if the existing account's email is verified.
            // This prevents account takeover: an attacker with a Google account
            // matching an unverified email cannot hijack the account.
            if (!existingUser.emailVerified) {
              return false // Block sign-in — email not verified, linking unsafe
            }
            // Safe to link: user proved email ownership via verification
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: "oauth",
                provider: "google",
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                refresh_token: account.refresh_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
              },
            })
            // Update user info from Google if missing
            if (!existingUser.emailVerified) {
              await prisma.user.update({
                where: { id: existingUser.id },
                data: { emailVerified: new Date() },
              })
            }
            // Set user.id so the JWT callback gets the right user
            user.id = existingUser.id
          }
        }
        // If no existing user, PrismaAdapter will create one after this callback
      }
      return true
    },
  },
  events: {
    async createUser({ user }) {
      // Envoyer un email de bienvenue aux nouveaux utilisateurs
      if (user.email) {
        const baseUrl = getBaseUrl()
        const userName = user.name || user.email.split("@")[0]

        // Pour les utilisateurs Google OAuth, l'email est déjà vérifié par Google
        // On envoie quand même un email de bienvenue avec un lien vers l'onboarding
        const onboardingUrl = `${baseUrl}/onboarding`
        const emailContent = emailTemplates.welcomeEmail(userName, onboardingUrl)

        try {
          await sendEmail({
            to: user.email,
            subject: emailContent.subject,
            html: emailContent.html,
          })
        } catch (error) {
          console.error("Failed to send welcome email:", error)
        }
      }
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development" || process.env.AUTH_DEBUG === "true",
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
