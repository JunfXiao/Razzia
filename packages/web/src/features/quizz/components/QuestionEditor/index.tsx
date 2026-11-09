import GameBackground from "@razzia/web/components/GameBackground"
import GameLogo from "@razzia/web/features/game/components/GameLogo"
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
  const [background, backgroundColor, logo, logoText] = useWatch({
    control,
    name: [
      "branding.background",
      "branding.backgroundColor",
      "branding.logo",
      "branding.logoText",
    ],
  })
  const { setBranding } = useGameBrandingStore()

  useEffect(() => {
    setBranding({ background, backgroundColor, logo, logoText })
  }, [background, backgroundColor, logo, logoText, setBranding])

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
        <GameLogo className="relative z-10 mx-auto w-fit shrink-0" />
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
