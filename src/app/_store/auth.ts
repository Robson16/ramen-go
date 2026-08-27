import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'USER'
}

interface AuthState {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: '@ramenGo:auth-state',
      partialize: (state) => ({
        user: state.user
          ? {
              id: state.user.id,
              name: state.user.name,
              role: state.user.role,
            }
          : null,
      }),
    },
  ),
)
