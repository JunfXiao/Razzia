import { STATUS } from "@razzia/common/types/game/status"
import GameBackground from "@razzia/web/components/GameBackground"
import Tooltip from "@razzia/web/components/Tooltip"
import Responses from "@razzia/web/features/game/components/states/Responses"
import { useManagerStore } from "@razzia/web/features/game/stores/manager"
import { ChevronLeft, ChevronRight, History, X } from "lucide-react"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"

const NAV_BUTTON_CLASS =
  "hover:bg-accent flex size-11 items-center justify-center rounded-md bg-white text-black disabled:opacity-40"

/** Read-only view of past reveals: it never touches the running game. */
const RevealReview = () => {
  const { reveals, status } = useManagerStore()
  const [index, setIndex] = useState<number | null>(null)
  const { t } = useTranslation()
  const isOpen = index !== null
  const lastIndex = reveals.length - 1

  const open = () => {
    // The latest reveal may already be on screen, so start one further back.
    const isShowingLatest = status?.name === STATUS.SHOW_RESPONSES

    setIndex(Math.max(0, isShowingLatest ? lastIndex - 1 : lastIndex))
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIndex(null)
      }

      if (event.key === "ArrowLeft") {
        setIndex((i) => Math.max(0, (i ?? 0) - 1))
      }

      if (event.key === "ArrowRight") {
        setIndex((i) => Math.min(lastIndex, (i ?? 0) + 1))
      }
    }

    window.addEventListener("keydown", handleKey)

    return () => window.removeEventListener("keydown", handleKey)
  }, [isOpen, lastIndex])

  if (reveals.length === 0) {
    return null
  }

  return (
    <>
      <Tooltip content={t("game:reviewAnswers")}>
        <button
          onClick={open}
          aria-label={t("game:reviewAnswers")}
          className="flex items-center justify-center rounded-lg bg-black/40 px-2.5 text-white drop-shadow-md hover:bg-black/60"
        >
          <History className="size-5" />
        </button>
      </Tooltip>

      {isOpen &&
        createPortal(
          <section className="fixed inset-0 z-60 flex flex-col">
            <GameBackground />

            <div className="z-10 flex items-center justify-between p-4">
              <div className="flex items-center rounded-md bg-white p-2 px-4 text-lg font-bold text-black">
                {`${index + 1} / ${reveals.length}`}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIndex(index - 1)}
                  disabled={index === 0}
                  aria-label={t("common:previous")}
                  className={NAV_BUTTON_CLASS}
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  onClick={() => setIndex(index + 1)}
                  disabled={index === lastIndex}
                  aria-label={t("common:next")}
                  className={NAV_BUTTON_CLASS}
                >
                  <ChevronRight className="size-6" />
                </button>
                <button
                  onClick={() => setIndex(null)}
                  aria-label={t("common:close")}
                  className={NAV_BUTTON_CLASS}
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="z-10 flex min-h-0 flex-1 flex-col">
              <Responses key={index} data={reveals[index]} silent />
            </div>
          </section>,
          document.body,
        )}
    </>
  )
}

export default RevealReview
