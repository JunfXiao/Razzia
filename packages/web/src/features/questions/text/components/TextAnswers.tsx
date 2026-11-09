import { MAX_TEXT_ANSWER_LENGTH } from "@razzia/common/constants"
import Button from "@razzia/web/components/Button"
import Input from "@razzia/web/components/Input"
import type { AnswerComponentProps } from "@razzia/web/features/questions/types"
import clsx from "clsx"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const TextAnswers = ({ onSubmit, readOnly, fill }: AnswerComponentProps) => {
  const [value, setValue] = useState("")
  const { t } = useTranslation()
  const answer = value.trim()

  if (readOnly) {
    return (
      <div className="mx-auto mb-6 flex w-full max-w-2xl justify-center px-2">
        <p className="text-foreground rounded-xl bg-white px-6 py-3 text-center text-xl font-bold shadow-md">
          {t("game:text.playersTyping")}
        </p>
      </div>
    )
  }

  return (
    <div
      className={clsx("mx-auto mb-4 flex w-full max-w-2xl flex-col px-2", {
        "flex-1 justify-center": fill,
      })}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()

          if (answer) {
            onSubmit([], answer)
          }
        }}
        className="flex flex-col gap-4"
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={MAX_TEXT_ANSWER_LENGTH}
          placeholder={t("game:text.yourAnswer")}
          aria-label={t("game:text.yourAnswer")}
          autoComplete="off"
          autoFocus
          className="mx-auto w-full max-w-sm bg-white text-center shadow-md"
        />
        <Button
          type="submit"
          disabled={!answer}
          className="mx-auto w-full max-w-xs shadow-md"
        >
          {t("game:confirm")}
        </Button>
      </form>
    </div>
  )
}

export default TextAnswers
