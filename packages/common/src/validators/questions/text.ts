import type { QuestionRefinement } from "@razzia/common/validators/questions"

// Accepted answers are only required in quiz mode, which is checked on the quizz.
export const refineTextQuestion: QuestionRefinement = () => undefined
