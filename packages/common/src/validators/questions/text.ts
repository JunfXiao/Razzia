import type { QuestionRefinement } from "@razzia/common/validators/questions"
import { z } from "zod"

export const textOptionsValidator = z.object({ wordCloud: z.boolean() })

// Accepted answers are only required in quiz mode, which is checked on the quizz.
export const refineTextQuestion: QuestionRefinement = () => undefined
