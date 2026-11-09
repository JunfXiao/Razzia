import Button from "@razzia/web/components/Button"
import BrandingFields from "@razzia/web/features/quizz/components/BrandingFields"
import { X } from "lucide-react"
import { Dialog } from "radix-ui"
import { useTranslation } from "react-i18next"

const QuizzBrandingButton = () => {
  const { t } = useTranslation()

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className="text-md bg-accent text-accent-foreground px-4 py-2 font-semibold">
          {t("quizz:branding.title")}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="bg-background fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl p-6"
        >
          <Dialog.Title className="text-foreground text-xl font-bold">
            {t("quizz:branding.title")}
          </Dialog.Title>
          <Dialog.Close
            aria-label={t("common:close")}
            className="hover:bg-muted absolute top-4 right-4 rounded-full p-1.5"
          >
            <X className="text-foreground size-6" />
          </Dialog.Close>

          <BrandingFields />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default QuizzBrandingButton
