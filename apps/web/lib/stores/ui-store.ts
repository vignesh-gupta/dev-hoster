"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

// Client-only UI preferences. Server data lives in TanStack Query, not here.
interface UiState {
  projectsView: "table" | "grid"
  setProjectsView: (v: "table" | "grid") => void

  // Build-log viewer preferences.
  logWrap: boolean
  logTimestamps: boolean
  logFollow: boolean
  setLogPref: (
    key: "logWrap" | "logTimestamps" | "logFollow",
    value: boolean
  ) => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      projectsView: "table",
      setProjectsView: (projectsView) => set({ projectsView }),

      logWrap: true,
      logTimestamps: true,
      logFollow: true,
      setLogPref: (key, value) => set({ [key]: value }),
    }),
    {
      name: "dev-hoster-ui",
      // Rehydrated from <Providers> after mount to avoid SSR hydration mismatches.
      skipHydration: true,
    }
  )
)
