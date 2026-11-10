import { STATUS } from "@razzia/common/types/game/status"
import { useGameBrandingStore } from "@razzia/web/features/game/stores/branding"
import { useManagerStore } from "@razzia/web/features/game/stores/manager"
import { createStatus } from "@razzia/web/features/game/utils/createStatus"
import { activeGameKey, createGame } from "@razzia/web/features/manager/queries"
import { ApiError } from "@razzia/web/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

/** Creates a game from a quizz and takes the manager to its lobby. */
export const useStartGame = () => {
  const queryClient = useQueryClient()
  const { updateManager } = useManagerStore()
  const { setBranding } = useGameBrandingStore()
  const navigate = useNavigate()
  const { t } = useTranslation()

  return useMutation({
    mutationFn: createGame,
    onSuccess: ({ gameId, inviteCode, branding }, quizzId) => {
      setBranding(branding)
      updateManager({
        gameId,
        quizzId,
        inviteCode,
        status: createStatus(STATUS.SHOW_ROOM, {
          text: "game:waitingForPlayers",
          inviteCode,
        }),
      })
      navigate({ to: "/party/manager/$gameId", params: { gameId } })
    },
    onError: (error) => {
      void queryClient.invalidateQueries({ queryKey: activeGameKey })
      toast.error(
        t(error instanceof ApiError ? error.key : "errors:quizz.notFound"),
      )
    },
  })
}
