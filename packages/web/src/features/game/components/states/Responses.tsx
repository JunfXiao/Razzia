import type { ManagerStatusDataMap } from "@razzia/common/types/game/status"
import AnswerButton from "@razzia/web/features/game/components/AnswerButton"
import AnswerNote from "@razzia/web/features/game/components/AnswerNote"
import {
  ANSWERS_COLORS,
  ANSWERS_LABELS,
  ROOMY_ANSWER_COUNT,
  SFX,
} from "@razzia/web/features/game/utils/constants"
import { calculatePercentages } from "@razzia/web/features/game/utils/score"
import { QUESTION_REGISTRY } from "@razzia/web/features/questions"
import clsx from "clsx"
import { useEffect, useState } from "react"
import useSound from "use-sound"

interface Props {
  data: ManagerStatusDataMap["SHOW_RESPONSES"]
  silent?: boolean
}

const Responses = ({ data, silent = false }: Props) => {
  const { question, answers, responses, solutions, type, note } = data
  const { ResponsesComponent } = QUESTION_REGISTRY[type]
  const percentages = calculatePercentages(responses)
  const isCompact = answers.length > ROOMY_ANSWER_COUNT
  const maxResponses = Math.max(1, ...Object.values(responses))

  // With many answers each share is small, so scale bars to the most chosen one.
  const barHeight = (key: number) =>
    isCompact && responses[key]
      ? `${(responses[key] / maxResponses) * 100}%`
      : percentages[key]
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)

  const [sfxResults] = useSound(SFX.RESULTS_SOUND, {
    volume: 0.2,
  })

  const [playMusic, { stop: stopMusic }] = useSound(SFX.ANSWERS.MUSIC, {
    volume: 0.2,
    onplay: () => {
      setIsMusicPlaying(true)
    },
    onend: () => {
      setIsMusicPlaying(false)
    },
  })

  useEffect(() => {
    if (silent) {
      return
    }

    stopMusic()
    sfxResults()
  }, [responses, playMusic, stopMusic, sfxResults, silent])

  useEffect(() => {
    if (!silent && !isMusicPlaying) {
      playMusic()
    }
  }, [isMusicPlaying, playMusic, silent])

  useEffect(() => {
    stopMusic()
  }, [playMusic, stopMusic])

  if (ResponsesComponent) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-8 pb-4">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>
        <ResponsesComponent data={data} />
        <AnswerNote note={note} />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col justify-between">
      <div className="mx-auto inline-flex h-full w-full max-w-7xl flex-1 flex-col items-center justify-center gap-5">
        <h2 className="text-center text-2xl font-bold text-white drop-shadow-lg md:text-4xl lg:text-5xl">
          {question}
        </h2>

        <div
          className={clsx(
            "grid h-40 w-full gap-4 px-2",
            isCompact ? "mt-4 max-w-7xl" : "mt-8 max-w-3xl",
          )}
          style={{ gridTemplateColumns: `repeat(${answers.length}, 1fr)` }}
        >
          {answers.map((_, key) => (
            <div
              key={key}
              className={clsx(
                "flex flex-col justify-end self-end overflow-hidden rounded-md",
                ANSWERS_COLORS[key],
              )}
              style={{ height: barHeight(key) }}
            >
              <span
                className={clsx(
                  "w-full bg-black/10 text-center font-bold whitespace-nowrap text-white drop-shadow-md",
                  isCompact ? "text-sm" : "text-lg",
                )}
              >
                {key in percentages ? percentages[key] : "0%"} (
                {responses[key] || 0})
              </span>
            </div>
          ))}
        </div>

        {isCompact && (
          <div
            className="mt-1 grid w-full max-w-7xl gap-4 px-2 text-center font-bold text-white drop-shadow-md"
            style={{ gridTemplateColumns: `repeat(${answers.length}, 1fr)` }}
          >
            {answers.map((_, key) => (
              <span key={key}>{ANSWERS_LABELS[key]}</span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <AnswerNote note={note} />
        <div
          className={clsx(
            "mx-auto mb-4 grid w-full max-w-7xl grid-cols-2 gap-1 px-2 text-lg font-bold text-white md:text-xl",
            isCompact
              ? "max-h-[35dvh] overflow-y-auto lg:grid-cols-5"
              : "rounded-full",
          )}
        >
          {answers.map((answer, key) => (
            <AnswerButton
              key={key}
              className={clsx(ANSWERS_COLORS[key], {
                "opacity-65": solutions && !solutions.includes(key),
              })}
              label={ANSWERS_LABELS[key]}
              correct={solutions ? solutions.includes(key) : undefined}
              compact={isCompact}
            >
              {answer}
            </AnswerButton>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Responses
