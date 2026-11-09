import type { TextResponse } from "@razzia/common/types/game"
import {
  type CloudLayout,
  layoutWordCloud,
} from "@razzia/web/features/questions/text/wordCloudLayout"
import { useEffect, useRef, useState } from "react"

const ANSWER_COLORS = 4

interface Props {
  responses: TextResponse[]
  graded: boolean
}

const TextWordCloud = ({ responses, graded }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layout, setLayout] = useState<CloudLayout | null>(null)
  const correctness = new Map(responses.map((r) => [r.text, r.correct]))

  useEffect(() => {
    if (!containerRef.current || responses.length === 0) {
      return
    }

    const { fontFamily } = getComputedStyle(containerRef.current)
    let cancel: (() => void) | null = null
    let isActive = true

    // Text is measured on a canvas, so the web font has to be ready first.
    void document.fonts.ready.then(() => {
      if (isActive) {
        cancel = layoutWordCloud(responses, { fontFamily, onDone: setLayout })
      }
    })

    return () => {
      isActive = false
      cancel?.()
    }
  }, [responses])

  const colorOf = (text: string, index: number) => {
    if (!graded) {
      return `var(--color-answer-${(index % ANSWER_COLORS) + 1})`
    }

    return correctness.get(text)
      ? "var(--color-correct)"
      : "var(--color-gray-500)"
  }

  return (
    <div
      ref={containerRef}
      className="flex h-[50vh] items-center justify-center rounded-2xl bg-white p-4 shadow-md"
    >
      {layout && (
        <svg
          viewBox={layout.viewBox}
          className="size-full"
          role="img"
          aria-label={responses.map(({ text }) => text).join(", ")}
        >
          {layout.words.map(({ text, x, y, size, rotate, count }, index) => (
            <text
              key={text}
              textAnchor="middle"
              transform={`translate(${x},${y}) rotate(${rotate})`}
              fontSize={size}
              fontWeight={700}
              fill={colorOf(text, index)}
            >
              <title>{count}</title>
              {text}
            </text>
          ))}
        </svg>
      )}
    </div>
  )
}

export default TextWordCloud
