import AlertDialog from "@razzia/web/components/AlertDialog"
import { useManagerStore } from "@razzia/web/features/game/stores/manager"
import { endGame } from "@razzia/web/features/manager/queries"
import { ApiError } from "@razzia/web/lib/api"
import { useMutation } from "@tanstack/react-query"
import { CircleStop } from "lucide-react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const EndGameButton = () => {
  const { gameId } = useManagerStore()
  const { t } = useTranslation()

  // The server answers with a game reset, which sends the manager back.
  const { mutate: end } = useMutation({
    mutationFn: endGame,
    onError: (error) => {
      toast.error(
        t(error instanceof ApiError ? error.key : "errors:game.notFound"),
      )
    },
  })

  if (!gameId) {
    return null
  }

  return (
    <AlertDialog
      trigger={
        <button className="flex items-center gap-1.5 rounded-lg bg-black/40 px-3 font-bold text-white drop-shadow-md hover:bg-black/60">
          <CircleStop className="size-5" />
          {t("game:endGame")}
        </button>
      }
      title={t("game:endGame")}
      description={t("game:endGameConfirm")}
      confirmLabel={t("game:endGame")}
      onConfirm={() => end(gameId)}
    />
  )
}

export default EndGameButton
