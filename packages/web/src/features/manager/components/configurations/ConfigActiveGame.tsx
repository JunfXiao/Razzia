import AlertDialog from "@razzia/web/components/AlertDialog"
import Button from "@razzia/web/components/Button"
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
  game: { gameId: string; inviteCode: string; subject: string }
}

const ConfigActiveGame = ({ game: { gameId, inviteCode, subject } }: Props) => {
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
    <div className="flex flex-1 flex-col gap-3">
      <div className="border-accent rounded-md border-2 p-3">
        <p className="text-muted-foreground text-sm font-semibold">
          {t("manager:activeGame.title")}
        </p>
        <p className="text-foreground truncate text-lg font-bold">{subject}</p>
        <p className="text-foreground font-semibold tabular-nums">
          {t("game:gamePinLabel")} {inviteCode}
        </p>
      </div>

      <Button
        onClick={() =>
          navigate({ to: "/party/manager/$gameId", params: { gameId } })
        }
      >
        {t("manager:activeGame.return")}
      </Button>

      <AlertDialog
        trigger={
          <Button className="bg-red-500">{t("manager:activeGame.end")}</Button>
        }
        title={t("manager:activeGame.end")}
        description={t("game:endGameConfirm")}
        confirmLabel={t("game:endGame")}
        onConfirm={() => end(gameId)}
      />
    </div>
  )
}

export default ConfigActiveGame
