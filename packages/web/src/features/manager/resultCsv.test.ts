import { QUESTION_TYPES, QUIZZ_MODES } from "@razzia/common/constants"
import type { GameResult, QuestionResult } from "@razzia/common/types/game"
import { buildResultCsv } from "@razzia/web/features/manager/resultCsv"
import { describe, expect, it } from "vitest"

const question = (overrides: Partial<QuestionResult>): QuestionResult => ({
  type: QUESTION_TYPES.SINGLE,
  question: "Pick, one",
  answers: ["A", "B"],
  solutions: [1],
  cooldown: 5,
  time: 10,
  playerAnswers: [],
  ...overrides,
})

const result = (questions: QuestionResult[]): GameResult => ({
  id: "1",
  gameMode: QUIZZ_MODES.QUIZ,
  subject: "Subject",
  date: "2026-11-09T00:00:00.000Z",
  players: [{ username: "Alice", points: 900, rank: 1 }],
  questions,
})

const lines = (game: GameResult) =>
  buildResultCsv(game).replace("\uFEFF", "").trim().split("\r\n")

describe("buildResultCsv", () => {
  it("writes one quoted row per player answer", () => {
    const [header, row] = lines(
      result([
        question({
          playerAnswers: [
            {
              playerName: "Alice",
              answerIds: [1],
              correct: true,
              points: 900,
            },
          ],
        }),
      ]),
    )

    expect(header.startsWith("Question no.,Question,Type")).toBe(true)
    expect(row).toBe('1,"Pick, one",single,Alice,B,yes,900,900,1')
  })

  it("starts with a BOM so Excel reads UTF-8", () => {
    expect(buildResultCsv(result([])).codePointAt(0)).toBe(0xfeff)
  })

  it("neutralizes formulas typed by players", () => {
    const [, row] = lines(
      result([
        question({
          type: QUESTION_TYPES.TEXT,
          playerAnswers: [
            {
              playerName: "Alice",
              answerIds: [-1],
              text: "=1+1",
              correct: false,
              points: 0,
            },
          ],
        }),
      ]),
    )

    expect(row.split(",")[5]).toBe("'=1+1")
  })

  it("leaves unanswered questions blank", () => {
    const [, row] = lines(
      result([
        question({
          playerAnswers: [{ playerName: "Alice", answerIds: null }],
        }),
      ]),
    )

    expect(row.split(",")[5]).toBe("")
  })
})
