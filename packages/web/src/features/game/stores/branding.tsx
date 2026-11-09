import type { QuizzBranding } from "@razzia/common/types/game"
import { create } from "zustand"

interface GameBrandingStore {
  branding: QuizzBranding | null
  setBranding: (_branding: QuizzBranding | null) => void
}

export const useGameBrandingStore = create<GameBrandingStore>((set) => ({
  branding: null,
  setBranding: (branding) => set({ branding }),
}))
