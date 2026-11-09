import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
  ROOMY_ANSWER_COUNT,
} from "@razzia/web/features/game/utils/constants"
import type { PreparedComponentProps } from "@razzia/web/features/questions/types"
import clsx from "clsx"

const PreparedAnswers = ({ totalAnswers }: PreparedComponentProps) => (
  <div
    className={clsx(
      "anim-quizz grid rounded-2xl bg-gray-700",
      totalAnswers > ROOMY_ANSWER_COUNT
        ? "w-80 max-w-full grid-cols-5 gap-2 p-3"
        : "aspect-square w-60 grid-cols-2 gap-4 p-5 md:w-60",
    )}
  >
    {Array.from({ length: totalAnswers }).map((_, key) => (
      <div
        key={key}
        className={clsx(
          "button shadow-inset flex aspect-square h-full w-full items-center justify-center rounded-2xl",
          ANSWERS_COLORS[key],
        )}
      >
        <span className="text-2xl font-bold text-white md:text-3xl">
          {ANSWERS_LABELS[key]}
        </span>
      </div>
    ))}
  </div>
)

export default PreparedAnswers
