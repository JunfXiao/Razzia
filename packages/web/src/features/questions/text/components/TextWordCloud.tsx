import type { TextResponse } from "@razzia/common/types/game"

const MIN_FONT_REM = 1.25
const FONT_RANGE_REM = 3.75
const ANSWER_COLORS = 4

/** Lays the words out so the most frequent ones end up in the middle. */
const centerOut = (responses: TextResponse[]) =>
  responses.reduce<TextResponse[]>(
    (list, response, index) =>
      index % 2 === 0 ? [...list, response] : [response, ...list],
    [],
  )

interface Props {
  responses: TextResponse[]
  graded: boolean
}

const TextWordCloud = ({ responses, graded }: Props) => {
  const maxCount = Math.max(1, ...responses.map(({ count }) => count))

  const colorOf = (correct: boolean, index: number) => {
    if (!graded) {
      return `var(--color-answer-${(index % ANSWER_COLORS) + 1})`
    }

    return correct ? "var(--color-correct)" : "var(--color-gray-500)"
  }

  return (
    <ul className="flex max-h-[50vh] flex-wrap items-center justify-center gap-x-6 gap-y-2 overflow-y-auto rounded-2xl bg-white p-6 shadow-md">
      {centerOut(responses).map(({ text, count, correct }, index) => (
        <li
          key={text}
          title={String(count)}
          className="leading-tight font-bold break-all"
          style={{
            fontSize: `${MIN_FONT_REM + (count / maxCount) * FONT_RANGE_REM}rem`,
            color: colorOf(correct, index),
          }}
        >
          {text}
        </li>
      ))}
    </ul>
  )
}

export default TextWordCloud
