import * as SecureStore from "expo-secure-store"
import type { ApiResponse } from "@pfp/shared-types"

const TOKEN_KEY = "pfp_auth_token"
const REFRESH_TOKEN_KEY = "pfp_refresh_token"

let baseUrl = __DEV__ ? "http://localhost:3000" : "https://profootprofile.com"

export function getBaseUrl(): string {
  return baseUrl
}

export function setApiBaseUrl(url: string) {
  baseUrl = url
}

export async function getStoredToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return null
  }
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}

type FetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  headers?: Record<string, string>
  authenticated?: boolean
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, authenticated = true } = options

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  }

  if (authenticated) {
    const token = await getStoredToken()
    if (token) {
      const cookieName = __DEV__
        ? "next-auth.session-token"
        : "__Secure-next-auth.session-token"
      requestHeaders["Cookie"] = `${cookieName}=${token}`
    }
  }

  const url = `${baseUrl}/api${endpoint}`

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `Erreur ${response.status}`,
      }
    }

    return { success: true, data: data.data ?? data }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur réseau",
    }
  }
}

export const api = {
  get: <T>(endpoint: string, options?: Omit<FetchOptions, "method">) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, { ...options, method: "POST", body }),

  put: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, { ...options, method: "PUT", body }),

  patch: <T>(endpoint: string, body?: unknown, options?: Omit<FetchOptions, "method" | "body">) =>
    apiFetch<T>(endpoint, { ...options, method: "PATCH", body }),

  delete: <T>(endpoint: string, options?: Omit<FetchOptions, "method">) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
}
