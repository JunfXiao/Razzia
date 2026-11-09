import type { Question } from "@razzia/common/types/game"

export { default as AnswerComponent } from "@razzia/web/features/questions/text/components/TextAnswers"

export { default as ConfigComponent } from "@razzia/web/features/questions/text/components/TextConfig"

export { default as AnswersEditor } from "@razzia/web/features/questions/text/components/TextEditor"

export { default as PreparedComponent } from "@razzia/web/features/questions/text/components/TextPrepared"

export { default as ResponsesComponent } from "@razzia/web/features/questions/text/components/TextResponses"

export const labelKey = "quizz:questionType.text"

export const initialValues = (): Partial<Question> => ({
  answers: [],
  solutions: undefined,
})
