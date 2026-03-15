// Auth.js v5 configuration
import NextAuth from "next-auth"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { sendEmail, emailTemplates } from "./email"
import { getBaseUrl } from "./url"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

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
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
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
      // Google OAuth: le rôle par défaut PLAYER est géré par le schema Prisma (@default)
      // Pour les utilisateurs existants qui se reconnectent via Google, on vérifie par email
      if (account?.provider === "google" && user.email) {
        await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true },
        })
        // Si l'utilisateur existe déjà, c'est une reconnexion - pas de traitement spécial
        // Si c'est un nouvel utilisateur, PrismaAdapter le créera après ce callback
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
  debug: process.env.NODE_ENV === "development",
}

export const { auth, handlers, signIn, signOut } = NextAuth(authConfig)
