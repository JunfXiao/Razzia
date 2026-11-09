import { ESTIMATION_INPUT_MODES } from "@razzia/common/constants"
import { isEstimationOptions } from "@razzia/common/questions/options"
import type { Question } from "@razzia/common/types/game"
import type { QuestionRefinement } from "@razzia/common/validators/questions"
import { z } from "zod"

export const estimationOptionsValidator = z.object({
  inputMode: z.enum(ESTIMATION_INPUT_MODES),
  min: z.number(),
  max: z.number(),
  step: z.number(),
  margin: z.number(),
})

export const isEstimationSolutionValid = ({
  options,
  solutions,
}: Pick<Question, "options" | "solutions">): boolean => {
  if (!isEstimationOptions(options)) {
    return true
  }

  const solution = solutions?.at(0)

  return (
    (solutions?.length ?? 0) <= 1 &&
    (solution === undefined ||
      (solution >= options.min && solution <= options.max))
  )
}

export const refineEstimationQuestion: QuestionRefinement = (
  { options },
  addIssue,
) => {
  if (!isEstimationOptions(options)) {
    addIssue(["options"], "errors:quizz.estimationInvalidOptions")

    return
  }

  if (options.step <= 0) {
    addIssue(["options", "step"], "errors:quizz.estimationStepInvalid")
  }

  if (options.margin < 0) {
    addIssue(["options", "margin"], "errors:quizz.estimationMarginNegative")
  }

  if (options.min >= options.max) {
    addIssue(["options", "max"], "errors:quizz.estimationInvalidRange")
  }
}
