import type { QuizzBranding } from "@razzia/common/types/game"
import AlertDialog from "@razzia/web/components/AlertDialog"
import Button from "@razzia/web/components/Button"
import { useGameBrandingStore } from "@razzia/web/features/game/stores/branding"
import {
  activeGameKey,
  endGame,
  resultKeys,
} from "@razzia/web/features/manager/queries"
import { ApiError } from "@razzia/web/lib/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

interface Props {
  game: {
    gameId: string
    inviteCode: string
    subject: string
    branding: QuizzBranding | null
  }
}

const ConfigActiveGame = ({
  game: { gameId, inviteCode, subject, branding },
}: Props) => {
  const { setBranding } = useGameBrandingStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { mutate: end } = useMutation({
    mutationFn: endGame,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: activeGameKey })
      void queryClient.invalidateQueries({ queryKey: resultKeys.all })
    },
    onError: (error) => {
      toast.error(
        t(error instanceof ApiError ? error.key : "errors:game.notFound"),
      )
    },
  })

  return (
    <div className="mb-4 flex shrink-0 flex-col gap-3">
      <div className="border-accent rounded-md border-2 p-3">
        <p className="text-muted-foreground text-sm font-semibold">
          {t("manager:activeGame.title")}
        </p>
        <p className="text-foreground truncate text-lg font-bold">{subject}</p>
        <p className="text-foreground font-semibold tabular-nums">
          {t("game:gamePinLabel")} {inviteCode}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => {
            setBranding(branding)
            navigate({ to: "/party/manager/$gameId", params: { gameId } })
          }}
        >
          {t("manager:activeGame.return")}
        </Button>

        <AlertDialog
          trigger={
            <Button className="bg-red-500">
              {t("manager:activeGame.end")}
            </Button>
          }
          title={t("manager:activeGame.end")}
          description={t("game:endGameConfirm")}
          confirmLabel={t("game:endGame")}
          onConfirm={() => end(gameId)}
        />
      </div>
    </div>
  )
}

export default ConfigActiveGame
