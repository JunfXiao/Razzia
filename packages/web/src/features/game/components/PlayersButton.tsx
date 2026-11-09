import Tooltip from "@razzia/web/components/Tooltip"
import { useManagerStore } from "@razzia/web/features/game/stores/manager"
import clsx from "clsx"
import { Users, X } from "lucide-react"
import { Dialog } from "radix-ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  count: number
}

const PlayersButton = ({ count }: Props) => {
  const { players } = useManagerStore()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Tooltip content={t("game:playersJoined")}>
        <button
          onClick={() => setOpen(true)}
          aria-label={t("game:playersJoined")}
          className="ml-auto flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 text-xl font-bold text-white drop-shadow-md hover:bg-black/60"
        >
          <Users className="size-5" />
          {count}
        </button>
      </Tooltip>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl p-6"
        >
          <Dialog.Title className="text-foreground text-xl font-bold">
            {t("game:playersJoined")} ({players.length})
          </Dialog.Title>
          <Dialog.Close
            aria-label={t("common:close")}
            className="hover:bg-muted absolute top-4 right-4 rounded-full p-1.5"
          >
            <X className="text-foreground size-6" />
          </Dialog.Close>
          <ul className="flex flex-wrap gap-2 overflow-y-auto">
            {players.map((player) => (
              <li
                key={player.id}
                title={
                  player.connected ? undefined : t("game:playerConnectionLost")
                }
                className={clsx(
                  "bg-primary rounded-xl px-3 py-2 text-lg font-bold break-all text-white",
                  { "opacity-50": !player.connected },
                )}
              >
                {player.username}
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default PlayersButton
