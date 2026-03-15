import type { Role } from "@pfp/shared-constants"

export interface UserBase {
  id: string
  email: string
  name: string | null
  image: string | null
  role: Role
  emailVerified: string | null
  createdAt: string
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  image: string | null
  role: Role
  isNewUser?: boolean
}

export interface UserSession {
  user: AuthUser
  accessToken: string
  expires: string
}
