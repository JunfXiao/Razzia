import Button from "@razzia/web/components/Button"
import type { SaveIssue } from "@razzia/web/features/quizz/saveErrors"
import { CircleAlert } from "lucide-react"
import { AlertDialog } from "radix-ui"
import { useTranslation } from "react-i18next"

interface Props {
  issues: SaveIssue[]
  onClose: () => void
  onSelectQuestion: (_index: number) => void
}

const SaveErrorsDialog = ({ issues, onClose, onSelectQuestion }: Props) => {
  const { t } = useTranslation()

  return (
    <AlertDialog.Root open={issues.length > 0}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <AlertDialog.Content className="bg-background fixed top-1/2 left-1/2 z-50 flex max-h-[80vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col gap-3 rounded-2xl border-t-4 border-red-500 p-6">
          <AlertDialog.Title className="text-foreground flex items-center gap-2 text-xl font-bold">
            <CircleAlert className="size-6 shrink-0 text-red-500" />
            {t("quizz:saveErrors.title")}
          </AlertDialog.Title>
          <AlertDialog.Description className="text-muted-foreground">
            {t("quizz:saveErrors.description")}
          </AlertDialog.Description>

          <ul className="flex min-h-0 flex-col gap-1.5 overflow-y-auto">
            {issues.map(({ questionIndex, message }) => {
              const label =
                questionIndex === null
                  ? t("quizz:saveErrors.general")
                  : t("quizz:saveErrors.question", {
                      number: questionIndex + 1,
                    })

              return (
                <li key={`${questionIndex}-${message}`}>
                  <button
                    type="button"
                    className="hover:bg-muted w-full rounded-lg bg-red-500/10 px-3 py-2 text-left"
                    onClick={() => {
                      if (questionIndex !== null) {
                        onSelectQuestion(questionIndex)
                      }

                      onClose()
                    }}
                  >
                    <span className="text-foreground block font-bold">
                      {label}
                    </span>
                    <span className="text-sm text-red-600">{t(message)}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <AlertDialog.Action asChild>
            <Button className="self-end px-4 py-2 text-sm" onClick={onClose}>
              {t("common:close")}
            </Button>
          </AlertDialog.Action>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}

export default SaveErrorsDialog
