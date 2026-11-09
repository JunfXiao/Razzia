import { MIN_ANSWERS, QUESTION_TYPES } from "@razzia/common/constants"
import { estimationAccuracy } from "@razzia/common/questions/estimation"
import { isEstimationOptions } from "@razzia/common/questions/options"
import { TEXT_NO_MATCH } from "@razzia/common/questions/text"
import type { Question } from "@razzia/common/types/game"

export const choiceInitialValues = (question: Question): Partial<Question> => {
  if (
    question.type !== QUESTION_TYPES.TEXT &&
    question.answers.length >= MIN_ANSWERS
  ) {
    return {}
  }

  return { answers: ["", ""], solutions: [0] }
}

export const isAnswerCorrect = (
  question: Question,
  answerIds: number[] | null,
): boolean => {
  const { solutions, options } = question

  if (question.type === QUESTION_TYPES.TEXT) {
    return Boolean(answerIds?.length) && answerIds?.[0] !== TEXT_NO_MATCH
  }

  if (!answerIds || !solutions) {
    return false
  }

  if (isEstimationOptions(options)) {
    const value = answerIds.at(0)
    const solution = solutions.at(0)

    return (
      value !== undefined &&
      solution !== undefined &&
      estimationAccuracy(value, solution, options.margin) > 0
    )
  }

  return answerIds.some((id) => solutions.includes(id))
}
