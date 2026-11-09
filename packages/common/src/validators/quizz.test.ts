import {
  ESTIMATION_INPUT_MODES,
  QUESTION_TYPES,
  QUIZZ_MODES,
  SCORING_MODES,
} from "@razzia/common/constants"
import type { Question, Quizz } from "@razzia/common/types/game"
import {
  normalizeLegacyQuizz,
  questionMediaValidator,
  quizzValidator,
} from "@razzia/common/validators/quizz"
import { describe, expect, it } from "vitest"

const choiceQuestion = (overrides: Partial<Question> = {}): Question => ({
  type: QUESTION_TYPES.SINGLE,
  question: "Question ?",
  answers: ["A", "B"],
  solutions: [0],
  cooldown: 5,
  time: 15,
  ...overrides,
})

const estimationQuestion = (overrides: Partial<Question> = {}): Question => ({
  type: QUESTION_TYPES.ESTIMATION,
  question: "How many ?",
  answers: [],
  solutions: [50],
  cooldown: 5,
  time: 15,
  options: {
    inputMode: ESTIMATION_INPUT_MODES.SLIDER,
    min: 0,
    max: 100,
    step: 1,
    margin: 10,
  },
  ...overrides,
})

const quizz = (
  questions: Question[],
  gameMode: Quizz["gameMode"] = QUIZZ_MODES.QUIZ,
): Quizz => ({ gameMode, subject: "Subject", questions })

const issues = (data: unknown) =>
  quizzValidator.safeParse(data).error?.issues.map((issue) => issue.message) ??
  []

describe("quizzValidator", () => {
  it("accepts a valid quizz mixing every question type", () => {
    const data = quizz([
      choiceQuestion(),
      choiceQuestion({
        type: QUESTION_TYPES.MULTI,
        answers: ["A", "B", "C", "D"],
        solutions: [0, 2],
        options: { scoringMode: SCORING_MODES.STRICT },
      }),
      estimationQuestion(),
    ])

    expect(issues(data)).toEqual([])
  })

  it("requires at least one question", () => {
    expect(issues(quizz([]))).toContain("errors:quizz.noQuestions")
  })

  it("requires a solution in quiz mode but not in survey mode", () => {
    const question = choiceQuestion({ solutions: [] })

    expect(issues(quizz([question]))).toContain("errors:quizz.noSolution")
    expect(issues(quizz([question], QUIZZ_MODES.SURVEY))).toEqual([])
  })

  it("limits choice questions to 2-10 answers", () => {
    expect(issues(quizz([choiceQuestion({ answers: ["A"] })]))).toContain(
      "errors:quizz.tooFewAnswers",
    )
    expect(
      issues(quizz([choiceQuestion({ answers: Array<string>(11).fill("A") })])),
    ).toContain("errors:quizz.tooManyAnswers")
  })

  it("accepts 0 max points but no negative points", () => {
    expect(issues(quizz([choiceQuestion({ maxPoints: 0 })]))).toEqual([])
    expect(issues(quizz([choiceQuestion({ maxPoints: -1 })]))).toContain(
      "errors:quizz.maxPointsNegative",
    )
    expect(issues(quizz([choiceQuestion({ penalty: -1 })]))).toContain(
      "errors:quizz.penaltyNegative",
    )
  })

  it("bounds the cooldown between 3 and 15 seconds", () => {
    expect(issues(quizz([choiceQuestion({ cooldown: 2 })]))).toContain(
      "errors:quizz.cooldownTooShort",
    )
    expect(issues(quizz([choiceQuestion({ cooldown: 16 })]))).toContain(
      "errors:quizz.cooldownTooLong",
    )
  })

  it("rejects estimation questions without options", () => {
    expect(
      issues(quizz([estimationQuestion({ options: undefined })])),
    ).toContain("errors:quizz.estimationInvalidOptions")
  })

  it.each([
    [{ step: 0 }, "errors:quizz.estimationStepInvalid"],
    [{ margin: -1 }, "errors:quizz.estimationMarginNegative"],
    [{ min: 100, max: 0 }, "errors:quizz.estimationInvalidRange"],
  ])("rejects invalid estimation options %o", (options, message) => {
    const question = estimationQuestion({
      options: {
        inputMode: ESTIMATION_INPUT_MODES.SLIDER,
        min: 0,
        max: 100,
        step: 1,
        margin: 10,
        ...options,
      },
    })

    expect(issues(quizz([question]))).toContain(message)
  })

  it("rejects an estimation solution outside of the range", () => {
    expect(issues(quizz([estimationQuestion({ solutions: [101] })]))).toContain(
      "errors:quizz.estimationSolutionOutOfRange",
    )
  })
})

describe("questionMediaValidator", () => {
  it.each(["/media/picture.png", "https://example.com/picture.png"])(
    "accepts %s",
    (url) => {
      expect(questionMediaValidator.safeParse({ url }).success).toBe(true)
    },
  )

  it.each(["picture.png", "/other/picture.png"])("rejects %s", (url) => {
    expect(questionMediaValidator.safeParse({ url }).success).toBe(false)
  })
})

describe("normalizeLegacyQuizz", () => {
  it("upgrades a quizz written by an older version", () => {
    const legacy = {
      subject: "Old",
      questions: [
        {
          question: "Q",
          answers: ["A", "B"],
          solutions: 1,
          cooldown: 5,
          time: 15,
          options: {},
        },
      ],
    }

    const normalized = normalizeLegacyQuizz(legacy)

    expect(normalized).toMatchObject({
      gameMode: QUIZZ_MODES.QUIZ,
      questions: [
        {
          type: QUESTION_TYPES.SINGLE,
          solutions: [1],
          options: { scoringMode: SCORING_MODES.BALANCED },
        },
      ],
    })
    expect(quizzValidator.safeParse(normalized).success).toBe(true)
  })

  it("leaves estimation options untouched", () => {
    const question = estimationQuestion()
    const normalized = normalizeLegacyQuizz(quizz([question])) as Quizz

    expect(normalized.questions[0].options).toEqual(question.options)
  })

  it("returns unknown data as is", () => {
    expect(normalizeLegacyQuizz("not a quizz")).toBe("not a quizz")
  })
})

describe("text questions", () => {
  const textQuestion = (overrides: Partial<Question> = {}): Question => ({
    type: QUESTION_TYPES.TEXT,
    question: "Capital of France ?",
    answers: ["Paris"],
    cooldown: 5,
    time: 15,
    ...overrides,
  })

  const validate = (
    question: Question,
    gameMode: Quizz["gameMode"] = QUIZZ_MODES.QUIZ,
  ) =>
    quizzValidator.safeParse({
      gameMode,
      subject: "Subject",
      questions: [question],
    })

  it("accepts accepted answers without solutions", () => {
    expect(validate(textQuestion()).success).toBe(true)
  })

  it("requires an accepted answer in quiz mode", () => {
    const result = validate(textQuestion({ answers: [] }))

    expect(result.error?.issues[0]?.message).toBe("errors:quizz.textNoAnswer")
  })

  it("needs no accepted answer in survey mode", () => {
    expect(
      validate(textQuestion({ answers: [] }), QUIZZ_MODES.SURVEY).success,
    ).toBe(true)
  })
})

describe("quizz branding and word clouds", () => {
  const buildQuizz = (extra: object, question: object = {}) => ({
    gameMode: QUIZZ_MODES.QUIZ,
    subject: "Subject",
    questions: [
      {
        type: QUESTION_TYPES.TEXT,
        question: "Q ?",
        answers: ["A"],
        cooldown: 5,
        time: 15,
        ...question,
      },
    ],
    ...extra,
  })

  it("accepts uploaded and external branding images", () => {
    const branding = {
      background: "/media/bg.png",
      logo: "https://example.com/logo.png",
    }

    expect(quizzValidator.parse(buildQuizz({ branding })).branding).toEqual(
      branding,
    )
  })

  it("accepts a solid color and a text logo", () => {
    const branding = { backgroundColor: "#12ab9F", logoText: "Razzia Night" }

    expect(quizzValidator.parse(buildQuizz({ branding })).branding).toEqual(
      branding,
    )
  })

  it("rejects a malformed color", () => {
    expect(
      quizzValidator.safeParse(
        buildQuizz({ branding: { backgroundColor: "red" } }),
      ).success,
    ).toBe(false)
  })

  it("rejects branding that is not a media url", () => {
    expect(
      quizzValidator.safeParse(buildQuizz({ branding: { logo: "nope" } }))
        .success,
    ).toBe(false)
  })

  it("keeps the word cloud option when reading a saved quizz", () => {
    const parsed = quizzValidator.parse(
      normalizeLegacyQuizz(buildQuizz({}, { options: { wordCloud: true } })),
    )

    expect(parsed.questions[0].options).toEqual({ wordCloud: true })
  })
})

describe("estimation solutions in survey mode", () => {
  it("ignores a hidden solution left outside the range", () => {
    const question = estimationQuestion({
      solutions: [50],
      options: {
        inputMode: ESTIMATION_INPUT_MODES.SLIDER,
        min: 16,
        max: 30,
        step: 1,
        margin: 0,
      },
    })

    expect(
      quizzValidator.safeParse({
        gameMode: QUIZZ_MODES.SURVEY,
        subject: "Subject",
        questions: [question],
      }).success,
    ).toBe(true)
    expect(
      quizzValidator.safeParse({
        gameMode: QUIZZ_MODES.QUIZ,
        subject: "Subject",
        questions: [question],
      }).error?.issues[0]?.message,
    ).toBe("errors:quizz.estimationSolutionOutOfRange")
  })
})

describe("blank answers", () => {
  const textQuestion = (answers: string[]): Question => ({
    type: QUESTION_TYPES.TEXT,
    question: "Q ?",
    answers,
    cooldown: 5,
    time: 15,
  })

  it("ignores a blank accepted answer hidden in survey mode", () => {
    expect(issues(quizz([textQuestion([""])], QUIZZ_MODES.SURVEY))).toEqual([])
  })

  it("rejects a blank accepted answer in quiz mode", () => {
    expect(issues(quizz([textQuestion(["Paris", ""])]))).toEqual([
      "errors:quizz.answerEmpty",
    ])
  })

  it("rejects a blank choice in both modes", () => {
    const question = choiceQuestion({ answers: ["A", ""] })

    expect(issues(quizz([question]))).toEqual(["errors:quizz.answerEmpty"])
    expect(issues(quizz([question], QUIZZ_MODES.SURVEY))).toEqual([
      "errors:quizz.answerEmpty",
    ])
  })
})
