import { isTextOptions } from "@razzia/common/questions/options"
import TextWordCloud from "@razzia/web/features/questions/text/components/TextWordCloud"
import type { ResponsesComponentProps } from "@razzia/web/features/questions/types"
import clsx from "clsx"
import { Check } from "lucide-react"

const TextResponses = ({
  data: { answers, options, textResponses = [] },
}: ResponsesComponentProps) => {
  const total = textResponses.reduce((sum, { count }) => sum + count, 0)
  const showWordCloud = isTextOptions(options) && options.wordCloud

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4">
      {answers.length > 0 && (
        <p className="bg-correct mx-auto flex w-fit items-center gap-2 rounded-xl px-4 py-2 text-xl font-bold break-words text-white shadow-md">
          <Check className="size-6 shrink-0 stroke-3" />
          {answers.join(" / ")}
        </p>
      )}

      {showWordCloud ? (
        <TextWordCloud responses={textResponses} graded={answers.length > 0} />
      ) : (
        <ul className="flex max-h-[50vh] flex-col gap-2 overflow-y-auto">
          {textResponses.map(({ text, count, correct }) => {
            const percent = `${Math.round((count / total) * 100)}%`

            return (
              <li
                key={text}
                className="relative overflow-hidden rounded-lg bg-white shadow-md"
              >
                <div
                  className={clsx(
                    "absolute inset-y-0 left-0",
                    correct ? "bg-correct/40" : "bg-gray-300/60",
                  )}
                  style={{ width: percent }}
                />
                <div className="text-foreground relative flex items-center justify-between gap-4 px-4 py-2 text-lg font-bold">
                  <span className="min-w-0 break-words">{text}</span>
                  <span className="shrink-0 tabular-nums">
                    {percent} ({count})
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default TextResponses
