import { api, getBaseUrl, storeToken, removeToken, getStoredToken } from "./api"
import type { AuthUser } from "@pfp/shared-types"
import type { LoginInput, RegisterInput } from "@pfp/shared-validators"
import { isMobileRole } from "@pfp/shared-constants"

export interface AuthResponse {
  user: AuthUser
  token: string
}

export async function login(credentials: LoginInput): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const result = await api.post<AuthResponse>("/auth/[...nextauth]", {
    ...credentials,
    callbackUrl: "/",
    json: true,
  }, { authenticated: false })

  if (!result.success || !result.data) {
    return { success: false, error: result.error || "Échec de connexion" }
  }

  if (!isMobileRole(result.data.user.role)) {
    return { success: false, error: "Cette application est réservée aux joueurs et agents." }
  }

  await storeToken(result.data.token)
  return { success: true, user: result.data.user }
}

export async function loginWithCredentials(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const baseUrl = getBaseUrl()
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/mobile-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await loginRes.json().catch(() => ({}))
    if (!loginRes.ok) {
      return {
        success: false,
        error: data?.error || "Email ou mot de passe incorrect",
      }
    }

    const sessionToken = data?.token
    if (!sessionToken) {
      return { success: false, error: "Réponse serveur invalide (token manquant)." }
    }

    await storeToken(sessionToken)

    const meResult = await api.get<AuthUser>("/users/me")
    if (!meResult.success || !meResult.data) {
      await removeToken()
      return { success: false, error: meResult.error || "Impossible de récupérer le profil" }
    }

    if (!isMobileRole(meResult.data.role)) {
      await removeToken()
      return { success: false, error: "Cette application est réservée aux joueurs et agents." }
    }

    return { success: true, user: meResult.data }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur réseau. Vérifiez l’URL de l’API et que le serveur tourne."
    return { success: false, error: message }
  }
}

export async function register(
  data: RegisterInput
): Promise<{ success: boolean; error?: string }> {
  if (!isMobileRole(data.role)) {
    return { success: false, error: "Seuls les rôles Joueur et Agent sont disponibles." }
  }

  const result = await api.post("/auth/register", data, { authenticated: false })

  if (!result.success) {
    return { success: false, error: result.error || "Échec de l'inscription" }
  }

  return { success: true }
}

export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const result = await api.post("/auth/forgot-password", { email }, { authenticated: false })
  return { success: result.success, error: result.error }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getStoredToken()
  if (!token) return null

  const result = await api.get<AuthUser>("/users/me")
  if (!result.success || !result.data) {
    return null
  }

  return result.data
}

export async function loginWithGoogle(
  idToken: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const baseUrl = getBaseUrl()
  try {
    const res = await fetch(`${baseUrl}/api/auth/mobile-google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      return {
        success: false,
        error: data?.error || "Échec de la connexion Google",
      }
    }

    const sessionToken = data?.token
    if (!sessionToken) {
      return { success: false, error: "Réponse serveur invalide (token manquant)." }
    }

    await storeToken(sessionToken)

    const meResult = await api.get<AuthUser>("/users/me")
    if (!meResult.success || !meResult.data) {
      await removeToken()
      return { success: false, error: meResult.error || "Impossible de récupérer le profil" }
    }

    if (!isMobileRole(meResult.data.role)) {
      await removeToken()
      return { success: false, error: "Cette application est réservée aux joueurs et agents." }
    }

    return { success: true, user: meResult.data }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erreur réseau."
    return { success: false, error: message }
  }
}

export async function logout(): Promise<void> {
  await removeToken()
}
