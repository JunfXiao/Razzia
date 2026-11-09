import { QUESTION_TYPES, QUIZZ_MODES } from "@razzia/common/constants"
import type {
  GameResult,
  PlayerAnswerRecord,
  QuestionResult,
} from "@razzia/common/types/game"
import { isAnswerCorrect } from "@razzia/web/features/questions/utils"

const HEADER = [
  "Question no.",
  "Question",
  "Type",
  "Player",
  "Answer",
  "Correct",
  "Points",
  "Total points",
  "Rank",
]

type Cell = string | number | null | undefined

// Spreadsheets run cells starting with these as formulas, and players type freely.
const FORMULA_START = /^[=+\-@\t\r]/u
const NEEDS_QUOTES = /[",;\r\n]/u

const toCell = (value: Cell): string => {
  if (value === null || value === undefined) {
    return ""
  }

  if (typeof value === "number") {
    return String(value)
  }

  const text = FORMULA_START.test(value) ? `'${value}` : value

  return NEEDS_QUOTES.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

const answerCell = (
  question: QuestionResult,
  { answerIds, text }: PlayerAnswerRecord,
): Cell => {
  if (!answerIds || answerIds.length === 0) {
    return null
  }

  if (question.type === QUESTION_TYPES.TEXT) {
    return text
  }

  if (question.type === QUESTION_TYPES.ESTIMATION) {
    return answerIds[0]
  }

  return answerIds.map((id) => question.answers[id]).join(" | ")
}

export const buildResultCsv = (result: GameResult): string => {
  const isSurvey = result.gameMode === QUIZZ_MODES.SURVEY

  const rows = result.questions.flatMap((question, index) =>
    question.playerAnswers.map((answer) => {
      const player = result.players.find(
        (p) => p.username === answer.playerName,
      )
      const isCorrect =
        answer.correct ?? isAnswerCorrect(question, answer.answerIds)

      const correctCell = isCorrect ? "yes" : "no"

      return [
        index + 1,
        question.question,
        question.type,
        answer.playerName,
        answerCell(question, answer),
        isSurvey ? null : correctCell,
        isSurvey ? null : answer.points,
        isSurvey ? null : player?.points,
        isSurvey ? null : player?.rank,
      ]
    }),
  )

  // The BOM makes Excel read the file as UTF-8.
  return `\uFEFF${[HEADER, ...rows]
    .map((row) => row.map(toCell).join(","))
    .join("\r\n")}\r\n`
}

export const downloadResultCsv = (result: GameResult): void => {
  const blob = new Blob([buildResultCsv(result)], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const name = result.subject.replace(/[\\/:*?"<>|]/gu, "_")

  a.href = url
  a.download = `${name}-${result.date.slice(0, 10)}.csv`
  a.click()

  URL.revokeObjectURL(url)
}
