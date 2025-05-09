"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type UserType = "legitimate" | "pirate"

interface UserState {
  username: string
  userType: UserType
  setUser: (username: string, userType: UserType) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      username: "",
      userType: "legitimate",
      setUser: (username, userType) => set({ username, userType }),
      clearUser: () => set({ username: "", userType: "legitimate" }),
    }),
    {
      name: "user-storage",
    },
  ),
)

interface TokenState {
  tokens: TokenData[]
  addToken: (token: TokenData) => void
  updateToken: (id: string, updates: Partial<TokenData>) => void
  toggleBan: (id: string) => void
  batchBan: (ids: string[]) => void
  batchUnban: (ids: string[]) => void
}

export interface TokenData {
  id: string
  userId: string
  concurrents: number
  hits1m: number
  hits5m: number
  hits15m: number
  banned: boolean
}

export const useTokenStore = create<TokenState>()((set) => ({
  tokens: [
    {
      id: "token-1",
      userId: "user-1",
      concurrents: 1,
      hits1m: 5,
      hits5m: 12,
      hits15m: 30,
      banned: false,
    },
    {
      id: "token-2",
      userId: "user-2",
      concurrents: 3,
      hits1m: 15,
      hits5m: 45,
      hits15m: 120,
      banned: false,
    },
    {
      id: "token-3",
      userId: "user-3",
      concurrents: 5,
      hits1m: 25,
      hits5m: 80,
      hits15m: 200,
      banned: true,
    },
    {
      id: "token-4",
      userId: "user-4",
      concurrents: 2,
      hits1m: 8,
      hits5m: 25,
      hits15m: 60,
      banned: false,
    },
    {
      id: "token-5",
      userId: "user-5",
      concurrents: 4,
      hits1m: 20,
      hits5m: 60,
      hits15m: 150,
      banned: false,
    },
  ],
  addToken: (token) => set((state) => ({ tokens: [...state.tokens, token] })),
  updateToken: (id, updates) =>
    set((state) => ({
      tokens: state.tokens.map((token) => (token.id === id ? { ...token, ...updates } : token)),
    })),
  toggleBan: (id) =>
    set((state) => ({
      tokens: state.tokens.map((token) => (token.id === id ? { ...token, banned: !token.banned } : token)),
    })),
  batchBan: (ids) =>
    set((state) => ({
      tokens: state.tokens.map((token) => (ids.includes(token.id) ? { ...token, banned: true } : token)),
    })),
  batchUnban: (ids) =>
    set((state) => ({
      tokens: state.tokens.map((token) => (ids.includes(token.id) ? { ...token, banned: false } : token)),
    })),
}))
