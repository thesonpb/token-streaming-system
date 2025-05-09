"use client"

import { create } from "zustand"

export interface UserData {
  id: string
  concurrents: number
  hits1m: number
  hits5m: number
  hits15m: number
  banned: boolean
}

interface UserDataState {
  users: UserData[]
  updateUser: (id: string, updates: Partial<UserData>) => void
  toggleUserBan: (id: string) => void
  batchUserBan: (ids: string[]) => void
  batchUserUnban: (ids: string[]) => void
}

export const useUserData = create<UserDataState>((set) => ({
  users: [
    {
      id: "id-R_Orange_Cherry_Raspberry",
      concurrents: 11,
      hits1m: 341,
      hits5m: 1348,
      hits15m: 1865,
      banned: true,
    },
    {
      id: "id-R_Raspberry_Nectarine_Fig",
      concurrents: 4,
      hits1m: 128,
      hits5m: 1060,
      hits15m: 2332,
      banned: true,
    },
    {
      id: "id-Watermelon_Quince_Nectarine",
      concurrents: 4,
      hits1m: 121,
      hits5m: 602,
      hits15m: 738,
      banned: true,
    },
    {
      id: "id-R_Watermelon_Orange_Xigua",
      concurrents: 4,
      hits1m: 120,
      hits5m: 400,
      hits15m: 1237,
      banned: true,
    },
    {
      id: "id-R_Date_Fig_Fig",
      concurrents: 3,
      hits1m: 90,
      hits5m: 245,
      hits15m: 659,
      banned: true,
    },
    {
      id: "id-R_Honeydew_Orange_Papaya",
      concurrents: 1,
      hits1m: 30,
      hits5m: 446,
      hits15m: 594,
      banned: false,
    },
    {
      id: "id-R_Orange_Jackfruit_Nectarine",
      concurrents: 0,
      hits1m: 0,
      hits5m: 519,
      hits15m: 4285,
      banned: false,
    },
    {
      id: "id-R_Orange_Apple_Cherry",
      concurrents: 1,
      hits1m: 34,
      hits5m: 292,
      hits15m: 404,
      banned: false,
    },
    {
      id: "id-R_Raspberry_Fig_Papaya",
      concurrents: 1,
      hits1m: 29,
      hits5m: 220,
      hits15m: 480,
      banned: false,
    },
  ],
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, ...updates } : user)),
    })),
  toggleUserBan: (id) =>
    set((state) => ({
      users: state.users.map((user) => (user.id === id ? { ...user, banned: !user.banned } : user)),
    })),
  batchUserBan: (ids) =>
    set((state) => ({
      users: state.users.map((user) => (ids.includes(user.id) ? { ...user, banned: true } : user)),
    })),
  batchUserUnban: (ids) =>
    set((state) => ({
      users: state.users.map((user) => (ids.includes(user.id) ? { ...user, banned: false } : user)),
    })),
}))
