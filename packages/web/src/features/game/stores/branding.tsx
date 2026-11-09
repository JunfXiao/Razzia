import type { QuizzBranding } from "@razzia/common/types/game"
import { create } from "zustand"

interface GameBrandingStore {
  branding: QuizzBranding | null
  setBranding: (_branding: QuizzBranding | null) => void
}

const preload = (url?: string) => {
  if (url) {
    new Image().src = url
  }
}

export const useGameBrandingStore = create<GameBrandingStore>((set) => ({
  branding: null,
  setBranding: (branding) => {
    preload(branding?.background)
    preload(branding?.logo)
    set({ branding })
  },
}))
