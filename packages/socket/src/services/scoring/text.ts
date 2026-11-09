import { QUESTION_TYPES } from "@razzia/common/constants"
import { TEXT_NO_MATCH } from "@razzia/common/questions/text"
import type { Question } from "@razzia/common/types/game"
import type { ScoringFn } from "@razzia/socket/services/scoring"

export const type = QUESTION_TYPES.TEXT

export const scoring: ScoringFn = (
  _question: Question,
  answerIds: number[],
): number => {
  const match = answerIds.at(0)

  return match === undefined || match === TEXT_NO_MATCH ? 0 : 1
}
