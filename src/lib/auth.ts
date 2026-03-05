// NextAuth configuration
import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import { sendEmail, emailTemplates } from "./email"
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

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() }
        })

        if (!user || !user.password) {
          throw new Error("Email ou mot de passe incorrect")
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect")
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          image: user.image,
        }
      }
    })
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
    async jwt({ token, user, account, trigger, session, isNewUser }) {
      // Lors de la première connexion
      if (user) {
        token.id = user.id
        // Récupérer le rôle depuis la base de données
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        })
        token.role = dbUser?.role || "PLAYER"
        
        // Marquer comme nouvel utilisateur si c'est le cas
        if (isNewUser) {
          token.isNewUser = true
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
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true }
        })
        // Si l'utilisateur existe déjà, c'est une reconnexion - pas de traitement spécial
        // Si c'est un nouvel utilisateur, PrismaAdapter le créera après ce callback
      }
      return true
    }
  },
  events: {
    async createUser({ user }) {
      // Envoyer un email de bienvenue aux nouveaux utilisateurs
      // User created event
      
      if (user.email) {
        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
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
          // Welcome email sent
        } catch (error) {
          console.error("Failed to send welcome email:", error)
        }
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}
