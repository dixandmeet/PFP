import { create } from "zustand"
import type { AuthUser } from "@pfp/shared-types"
import { getCurrentUser, logout as logoutApi } from "@/lib/auth"

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean

  setUser: (user: AuthUser | null) => void
  initialize: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isLoading: false }),

  initialize: async () => {
    set({ isLoading: true })
    try {
      const user = await getCurrentUser()
      set({ user, isAuthenticated: !!user, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  logout: async () => {
    await logoutApi()
    set({ user: null, isAuthenticated: false })
  },
}))
