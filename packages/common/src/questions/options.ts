import type {
  EstimationQuestionOptions,
  MultiQuestionOptions,
  QuestionOptions,
  TextQuestionOptions,
} from "@razzia/common/types/game"

export const isMultiOptions = (
  options?: QuestionOptions,
): options is MultiQuestionOptions =>
  options !== undefined && "scoringMode" in options

export const isTextOptions = (
  options?: QuestionOptions,
): options is TextQuestionOptions =>
  options !== undefined && "wordCloud" in options

export const isEstimationOptions = (
  options?: QuestionOptions,
): options is EstimationQuestionOptions =>
  options !== undefined && "min" in options && "max" in options
