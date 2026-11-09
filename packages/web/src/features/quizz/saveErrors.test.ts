import { collectSaveIssues } from "@razzia/web/features/quizz/saveErrors"
import { describe, expect, it } from "vitest"

const leaf = (message: string) => ({
  type: "custom",
  message,
  ref: { parent: { deep: "ignored", message: "not an error" } },
})

describe("collectSaveIssues", () => {
  it("lists general errors first, then each question", () => {
    const answers = []

    answers[1] = leaf("errors:quizz.answerEmpty")

    const questions = []

    questions[2] = { question: leaf("errors:quizz.questionEmpty"), answers }

    expect(
      collectSaveIssues({
        subject: leaf("errors:quizz.subjectEmpty"),
        questions,
      }),
    ).toEqual([
      { questionIndex: null, message: "errors:quizz.subjectEmpty" },
      { questionIndex: 2, message: "errors:quizz.questionEmpty" },
      { questionIndex: 2, message: "errors:quizz.answerEmpty" },
    ])
  })

  it("repeats a message only once per question", () => {
    const empty = leaf("errors:quizz.answerEmpty")

    expect(
      collectSaveIssues({ questions: [{ answers: [empty, empty] }] }),
    ).toEqual([{ questionIndex: 0, message: "errors:quizz.answerEmpty" }])
  })

  it("keeps an error on the question list itself", () => {
    expect(
      collectSaveIssues({ questions: leaf("errors:quizz.noQuestions") }),
    ).toEqual([{ questionIndex: null, message: "errors:quizz.noQuestions" }])
  })
})
