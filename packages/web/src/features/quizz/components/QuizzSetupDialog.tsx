import { QUIZZ_MODES } from "@razzia/common/constants"
import type { QuizzMode } from "@razzia/common/types/game"
import Button from "@razzia/web/components/Button"
import Input from "@razzia/web/components/Input"
import BrandingFields from "@razzia/web/features/quizz/components/BrandingFields"
import {
  useQuizzEditor,
  type QuizzFormValues,
} from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { useNavigate } from "@tanstack/react-router"
import clsx from "clsx"
import { ChartColumn, Trophy } from "lucide-react"
import { Dialog } from "radix-ui"
import { type SubmitEvent, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

const MODES = [
  {
    value: QUIZZ_MODES.QUIZ,
    icon: Trophy,
    descriptionKey: "quizz:setup.quizDescription",
  },
  {
    value: QUIZZ_MODES.SURVEY,
    icon: ChartColumn,
    descriptionKey: "quizz:setup.surveyDescription",
  },
] as const

const QuizzSetupDialog = () => {
  const { quizzId } = useQuizzEditor()
  const { control, setValue } = useFormContext<QuizzFormValues>()
  const gameMode = useWatch({ control, name: "gameMode" })
  const [open, setOpen] = useState(!quizzId)
  const [name, setName] = useState("")
  const navigate = useNavigate()
  const { t } = useTranslation()

  const selectMode = (mode: QuizzMode) =>
    setValue("gameMode", mode, { shouldDirty: true })

  const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (name.trim()) {
      setValue("subject", name.trim(), { shouldDirty: true })
      setOpen(false)
    }
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          onEscapeKeyDown={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
          className="bg-background fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl p-6"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Dialog.Title className="text-foreground text-xl font-bold">
              {t("quizz:setup.title")}
            </Dialog.Title>

            <div className="grid gap-3 sm:grid-cols-2">
              {MODES.map(({ value, icon: Icon, descriptionKey }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={gameMode === value}
                  onClick={() => selectMode(value)}
                  className={clsx(
                    "flex flex-col gap-1 rounded-xl border-2 p-3 text-left",
                    gameMode === value
                      ? "border-primary bg-primary/10"
                      : "border-accent",
                  )}
                >
                  <span className="text-foreground flex items-center gap-2 font-bold">
                    <Icon className="size-5" />
                    {t(`quizz:gameMode.${value}`)}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {t(descriptionKey)}
                  </span>
                </button>
              ))}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-foreground font-semibold">
                {t("quizz:setup.name")}
              </span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("quizz:titleQuizzPlaceholder")}
                autoFocus
              />
            </label>

            <BrandingFields />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                className="bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold"
                onClick={() => navigate({ to: "/manager/config" })}
              >
                {t("common:cancel")}
              </Button>
              <Button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 text-sm font-semibold"
              >
                {t("quizz:setup.continue")}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default QuizzSetupDialog
