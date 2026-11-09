import Button from "@razzia/web/components/Button"
import AnswerButton from "@razzia/web/features/game/components/AnswerButton"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
  ROOMY_ANSWER_COUNT,
} from "@razzia/web/features/game/utils/constants"
import type { AnswerComponentProps } from "@razzia/web/features/questions/types"
import clsx from "clsx"
import { useState } from "react"
import { useTranslation } from "react-i18next"

const MultiAnswers = ({
  answers,
  onSubmit,
  readOnly,
  fill,
}: AnswerComponentProps) => {
  const [selected, setSelected] = useState<number[]>([])
  const { t } = useTranslation()
  const isCompact = answers.length > ROOMY_ANSWER_COUNT

  const handleSubmit = () => onSubmit(selected)

  const toggle = (key: number) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    )
  }

  return (
    <div
      className={clsx(
        "mx-auto mb-4 flex w-full max-w-7xl flex-col gap-2 px-2",
        {
          "flex-1": fill,
        },
      )}
    >
      <div
        className={clsx(
          "grid gap-1 text-lg font-bold text-white md:text-xl",
          fill ? "flex-1 grid-cols-1 sm:grid-cols-2" : "grid-cols-2",
          fill && !isCompact && "auto-rows-fr",
          {
            "min-h-0 overflow-y-auto": isCompact,
            "max-h-[60dvh]": isCompact && fill,
            "max-h-[45dvh] lg:grid-cols-3": isCompact && !fill,
          },
        )}
      >
        {answers.map((answer, key) => {
          const isSelected = selected.includes(key)

          return (
            <AnswerButton
              key={key}
              className={ANSWERS_COLORS[key]}
              label={ANSWERS_LABELS[key]}
              onClick={() => toggle(key)}
              selected={readOnly ? undefined : isSelected}
              disabled={readOnly}
              large={fill}
              compact={isCompact}
            >
              {answer}
            </AnswerButton>
          )
        })}
      </div>
      {!readOnly && (
        <Button
          onClick={handleSubmit}
          disabled={selected.length === 0}
          className="mx-auto w-full max-w-xs"
        >
          {t("game:confirm")}
        </Button>
      )}
    </div>
  )
}

export default MultiAnswers
