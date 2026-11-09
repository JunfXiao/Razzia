import AlertDialog from "@razzia/web/components/AlertDialog"
import { leaveGame } from "@razzia/web/features/game/queries"
import { clearToken } from "@razzia/web/lib/session"
import { RotateCcw } from "lucide-react"
import { useTranslation } from "react-i18next"

const restart = async () => {
  const gameId = localStorage.getItem("game_id")
  const pin = localStorage.getItem("game_pin")

  if (gameId) {
    // A stuck client must still be able to reset, so failures are ignored.
    await leaveGame(gameId).catch(() => undefined)
  }

  localStorage.removeItem("game_id")
  localStorage.removeItem("game_pin")
  clearToken()
  window.location.assign(pin ? `/?pin=${encodeURIComponent(pin)}` : "/")
}

const RestartButton = () => {
  const { t } = useTranslation()

  return (
    <AlertDialog
      trigger={
        <button className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-200">
          <RotateCcw className="size-4" />
          {t("game:restart.button")}
        </button>
      }
      title={t("game:restart.button")}
      description={t("game:restart.description")}
      confirmLabel={t("game:restart.button")}
      onConfirm={() => void restart()}
    />
  )
}

export default RestartButton
