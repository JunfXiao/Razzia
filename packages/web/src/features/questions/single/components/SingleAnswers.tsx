import AnswerButton from "@razzia/web/features/game/components/AnswerButton"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
  ROOMY_ANSWER_COUNT,
} from "@razzia/web/features/game/utils/constants"
import type { AnswerComponentProps } from "@razzia/web/features/questions/types"
import clsx from "clsx"

const SingleAnswers = ({
  answers,
  onSubmit,
  readOnly,
  fill,
}: AnswerComponentProps) => {
  const handleSubmit = (key: number) => onSubmit([key])
  const isCompact = answers.length > ROOMY_ANSWER_COUNT

  return (
    <div
      className={clsx(
        "mx-auto mb-4 grid w-full max-w-7xl gap-1 px-2 text-lg font-bold text-white md:text-xl",
        fill ? "flex-1 grid-cols-1 sm:grid-cols-2" : "grid-cols-2",
        fill && !isCompact && "auto-rows-fr",
        {
          "min-h-0 overflow-y-auto": isCompact,
          "max-h-[60dvh]": isCompact && fill,
          "max-h-[45dvh] lg:grid-cols-3": isCompact && !fill,
        },
      )}
    >
      {answers.map((answer, key) => (
        <AnswerButton
          key={key}
          className={ANSWERS_COLORS[key]}
          label={ANSWERS_LABELS[key]}
          onClick={() => handleSubmit(key)}
          disabled={readOnly}
          large={fill}
          compact={isCompact}
        >
          {answer}
        </AnswerButton>
      ))}
    </div>
  )
}

export default SingleAnswers
