import { createDefaultGameSettings } from "@razzia/common/constants"
import type { GameSettings, Player } from "@razzia/common/types/game"
import type { Reveal, StatusDataMap } from "@razzia/common/types/game/status"
import type { Status } from "@razzia/web/features/game/utils/createStatus"
import { create } from "zustand"

interface ManagerState<T> {
  gameId: string | null
  inviteCode: string | null
  settings: GameSettings
  locked: boolean
  status: Status<T> | null
  players: Player[]
  reveals: Reveal[]
}

type ManagerStore<T> = ManagerState<T> & {
  updateManager: (_state: Partial<ManagerState<T>>) => void
  addReveal: (_reveal: Reveal) => void
  resetManager: () => void
}

const initialState: ManagerState<StatusDataMap> = {
  gameId: null,
  inviteCode: null,
  settings: createDefaultGameSettings(),
  locked: false,
  status: null,
  players: [],
  reveals: [],
}

export const useManagerStore = create<ManagerStore<StatusDataMap>>((set) => ({
  ...initialState,

  updateManager: (state) => set(state),

  addReveal: (reveal) =>
    set((state) => ({ reveals: [...state.reveals, reveal] })),

  resetManager: () => set(initialState),
}))
