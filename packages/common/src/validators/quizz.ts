import {
  MAX_LOGO_TEXT_LENGTH,
  MAX_MEDIA_SIZE,
  MEDIA_TYPES,
  MEDIA_URL_PREFIX,
  QUESTION_TYPES,
  QUIZZ_MODES,
  SCORING_MODES,
} from "@razzia/common/constants"
import { QUESTION_REFINEMENTS } from "@razzia/common/validators/questions"
import { multiOptionsValidator } from "@razzia/common/validators/questions/choice"
import { estimationOptionsValidator } from "@razzia/common/validators/questions/estimation"
import { textOptionsValidator } from "@razzia/common/validators/questions/text"
import { z } from "zod"

const mediaUrlValidator = z
  .string("errors:quizz.invalidMediaUrl")
  .refine(
    (url) => url.startsWith(MEDIA_URL_PREFIX) || z.url().safeParse(url).success,
    "errors:quizz.invalidMediaUrl",
  )

export const questionMediaValidator = z.object({
  type: z
    .enum([MEDIA_TYPES.IMAGE, MEDIA_TYPES.VIDEO, MEDIA_TYPES.AUDIO])
    .optional(),
  url: mediaUrlValidator,
})

const quizzBrandingValidator = z.object({
  background: mediaUrlValidator.optional(),
  backgroundColor: z
    .string()
    .regex(/^#[0-9a-f]{6}$/iu, "errors:quizz.invalidBranding")
    .optional(),
  logo: mediaUrlValidator.optional(),
  logoText: z
    .string()
    .min(1, "errors:quizz.invalidBranding")
    .max(MAX_LOGO_TEXT_LENGTH, "errors:quizz.invalidBranding")
    .optional(),
})

export const mediaUploadValidator = z.object({
  file: z
    .file("errors:media.missingFile")
    .max(MAX_MEDIA_SIZE, "errors:media.tooLarge"),
})

const questionSchema = z.object({
  type: z.enum(QUESTION_TYPES),
  question: z.string().min(1, "errors:quizz.questionEmpty"),
  category: z.string().optional(),
  note: z.string().optional(),
  media: questionMediaValidator.optional(),
  answers: z.array(z.string().min(1, "errors:quizz.answerEmpty")),
  solutions: z.array(z.number()).optional(),
  cooldown: z
    .number()
    .int()
    .min(3, "errors:quizz.cooldownTooShort")
    .max(15, "errors:quizz.cooldownTooLong"),
  time: z.number().int().min(-1),
  maxPoints: z
    .number()
    .int()
    .min(0, "errors:quizz.maxPointsNegative")
    .optional(),
  penalty: z.number().int().min(0, "errors:quizz.penaltyNegative").optional(),
  options: z
    .union([
      multiOptionsValidator,
      estimationOptionsValidator,
      textOptionsValidator,
    ])
    .optional(),
})

const questionValidator = questionSchema.superRefine((question, ctx) => {
  QUESTION_REFINEMENTS[question.type](question, (path, message) =>
    ctx.addIssue({ code: "custom", path, message }),
  )
})

export const quizzValidator = z
  .object({
    gameMode: z.enum(QUIZZ_MODES),
    subject: z.string().min(1, "errors:quizz.subjectEmpty"),
    branding: quizzBrandingValidator.optional(),
    questions: z.array(questionValidator).min(1, "errors:quizz.noQuestions"),
  })
  .superRefine((quizz, ctx) => {
    if (quizz.gameMode !== QUIZZ_MODES.QUIZ) {
      return
    }

    quizz.questions.forEach((question, index) => {
      if (question.type === QUESTION_TYPES.TEXT) {
        if (question.answers.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["questions", index, "answers"],
            message: "errors:quizz.textNoAnswer",
          })
        }

        return
      }

      if (question.solutions && question.solutions.length > 0) {
        return
      }

      ctx.addIssue({
        code: "custom",
        path: ["questions", index, "solutions"],
        message: "errors:quizz.noSolution",
      })
    })
  })

export type QuizzValidated = z.infer<typeof quizzValidator>

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

/**
 * Upgrades quizz files written by older versions: quizzes without a `gameMode`,
 * questions without a `type`, a scalar `solutions`, or options without a
 * `scoringMode`.
 */
export const normalizeLegacyQuizz = (data: unknown): unknown => {
  if (!isRecord(data) || !Array.isArray(data.questions)) {
    return data
  }

  return {
    ...data,
    gameMode: data.gameMode ?? QUIZZ_MODES.QUIZ,
    questions: data.questions.map((question: unknown) => {
      if (!isRecord(question)) {
        return question
      }

      return {
        ...question,
        type: question.type ?? QUESTION_TYPES.SINGLE,
        solutions:
          question.solutions === undefined || Array.isArray(question.solutions)
            ? question.solutions
            : [question.solutions],
        ...(isRecord(question.options) &&
        question.type !== QUESTION_TYPES.ESTIMATION &&
        question.type !== QUESTION_TYPES.TEXT
          ? {
              options: {
                scoringMode: SCORING_MODES.BALANCED,
                ...question.options,
              },
            }
          : {}),
      }
    }),
  }
}
