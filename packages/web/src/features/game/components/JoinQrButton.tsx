import Tooltip from "@razzia/web/components/Tooltip"
import { useManagerStore } from "@razzia/web/features/game/stores/manager"
import { X } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"
import { Dialog } from "radix-ui"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const JoinQrButton = () => {
  const { inviteCode } = useManagerStore()
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const joinUrl = `${window.location.origin}?pin=${inviteCode}`

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Tooltip content={t("game:showQrCode")}>
        <button
          onClick={() => setOpen(true)}
          aria-label={t("game:showQrCode")}
          className="rounded bg-white p-0.5"
        >
          <QRCodeSVG className="size-7" value={joinUrl} />
        </button>
      </Tooltip>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6"
        >
          <Dialog.Title className="sr-only">
            {t("game:showQrCode")}
          </Dialog.Title>
          <Dialog.Close
            aria-label={t("common:close")}
            className="hover:bg-muted absolute -top-3 -right-3 rounded-full bg-white p-1.5 shadow-md"
          >
            <X className="text-foreground size-6" />
          </Dialog.Close>
          <QRCodeSVG
            className="size-56 md:size-70 lg:size-95"
            value={joinUrl}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default JoinQrButton
