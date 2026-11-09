import { QUIZZ_MODES } from "@razzia/common/constants"
import FieldError from "@razzia/web/components/forms/FieldError"
import {
  useQuizzEditor,
  type QuizzFormValues,
} from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import clsx from "clsx"
import { Minus, Plus } from "lucide-react"
import {
  Controller,
  get,
  useFormContext,
  useFormState,
  type FieldError as FieldErrorType,
} from "react-hook-form"
import { useTranslation } from "react-i18next"

const TextEditor = () => {
  const {
    currentQuestion: { answers },
    currentIndex,
    gameMode,
    updateQuestion,
    questionPath,
  } = useQuizzEditor()
  const { control } = useFormContext<QuizzFormValues>()
  const answersPath = questionPath("answers")
  const { errors } = useFormState({ control, name: answersPath })
  const { t } = useTranslation()
  const listError = get(errors, answersPath) as FieldErrorType | undefined

  if (gameMode === QUIZZ_MODES.SURVEY) {
    return (
      <p className="text-muted-foreground bg-background z-10 rounded-2xl px-5 py-4 font-semibold shadow-sm">
        {t("quizz:question.text.surveyHint")}
      </p>
    )
  }

  return (
    <div className="z-10 flex flex-col gap-3">
      <div className="text-muted-foreground bg-background w-fit rounded-lg px-2 py-1 text-sm font-semibold">
        {t("quizz:question.text.acceptedAnswers")}
      </div>

      {answers.map((_, i) => (
        <Controller
          key={i}
          control={control}
          name={questionPath(`answers.${i}`)}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <div
                className={clsx(
                  "bg-correct flex items-center gap-3 rounded-2xl px-4 py-3",
                  fieldState.invalid && "ring-2 ring-red-500",
                )}
              >
                <input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  aria-describedby={
                    fieldState.invalid ? `${field.name}-error` : undefined
                  }
                  className="w-full bg-transparent font-semibold text-white placeholder-white/70 outline-none"
                  placeholder={t("quizz:addAnswerPlaceholder")}
                />
                <button
                  type="button"
                  aria-label={t("quizz:removeAnswer")}
                  onClick={() =>
                    updateQuestion(currentIndex, {
                      answers: answers.filter((__, index) => index !== i),
                    })
                  }
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-black/20 text-white"
                >
                  <Minus className="size-4" />
                </button>
              </div>
              <FieldError
                id={`${field.name}-error`}
                errors={[fieldState.error]}
                pill
              />
            </div>
          )}
        />
      ))}

      <button
        type="button"
        onClick={() =>
          updateQuestion(currentIndex, { answers: [...answers, ""] })
        }
        className="bg-accent text-accent-foreground flex w-fit items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold"
      >
        <Plus className="size-4" />
        {t("quizz:addAnswer")}
      </button>

      <p className="text-muted-foreground bg-background w-fit rounded-lg px-2 py-1 text-sm">
        {t("quizz:question.text.acceptedAnswersHint")}
      </p>

      <FieldError errors={[listError]} pill />
    </div>
  )
}

export default TextEditor
