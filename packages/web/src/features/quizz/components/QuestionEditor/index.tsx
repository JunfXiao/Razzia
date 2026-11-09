import GameBackground from "@razzia/web/components/GameBackground"
import { useGameBrandingStore } from "@razzia/web/features/game/stores/branding"
import { QUESTION_REGISTRY } from "@razzia/web/features/questions"
import QuestionEditorAnswers from "@razzia/web/features/quizz/components/QuestionEditor/QuestionEditorAnswers"
import QuestionEditorConfig from "@razzia/web/features/quizz/components/QuestionEditor/QuestionEditorConfig"
import QuestionEditorMedia from "@razzia/web/features/quizz/components/QuestionEditor/QuestionEditorMedia"
import QuestionEditorNote from "@razzia/web/features/quizz/components/QuestionEditor/QuestionEditorNote"
import QuestionEditorTitle from "@razzia/web/features/quizz/components/QuestionEditor/QuestionEditorTitle"
import {
  useQuizzEditor,
  type QuizzFormValues,
} from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { useEffect } from "react"
import { useFormContext, useWatch } from "react-hook-form"

const QuestionEditor = () => {
  const { currentQuestion, currentQuestionId, isRemoving } = useQuizzEditor()
  const { control } = useFormContext<QuizzFormValues>()
  const background = useWatch({ control, name: "branding.background" })
  const logo = useWatch({ control, name: "branding.logo" })
  const { setBranding } = useGameBrandingStore()

  useEffect(() => {
    setBranding(background || logo ? { background, logo } : null)
  }, [background, logo, setBranding])

  useEffect(() => () => setBranding(null), [setBranding])

  const AnswersEditor =
    QUESTION_REGISTRY[currentQuestion.type].AnswersEditor ??
    QuestionEditorAnswers

  if (isRemoving) {
    return null
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="mx-auto flex max-w-7xl flex-1 flex-col gap-4 overflow-y-auto p-6">
        {logo && (
          <img
            src={logo}
            alt=""
            className="relative z-10 mx-auto h-10 shrink-0 object-contain md:h-14"
          />
        )}
        <QuestionEditorTitle />
        <QuestionEditorMedia />
        <QuestionEditorNote />
        <AnswersEditor key={currentQuestionId} />

        <GameBackground />
      </main>
      <QuestionEditorConfig />
    </div>
  )
}

export default QuestionEditor
