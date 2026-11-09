import { isTextOptions } from "@razzia/common/questions/options"
import Switch from "@razzia/web/components/Switch"
import BaseConfig from "@razzia/web/features/quizz/components/QuestionEditor/QuestionEditorConfig/BaseConfig"
import ConfigField from "@razzia/web/features/quizz/components/QuestionEditor/QuestionEditorConfig/ConfigField"
import { useQuizzEditor } from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { Cloud } from "lucide-react"
import { useTranslation } from "react-i18next"

const TextConfig = () => {
  const { currentQuestion, currentIndex, updateQuestion } = useQuizzEditor()
  const { t } = useTranslation()
  const { options } = currentQuestion
  const wordCloud = isTextOptions(options) && options.wordCloud

  return (
    <>
      <ConfigField>
        <ConfigField.Label
          icon={<Cloud className="size-4" />}
          label={t("quizz:question.config.wordCloud")}
          action={
            <Switch
              aria-label={t("quizz:question.config.wordCloud")}
              checked={wordCloud}
              onCheckedChange={(checked) =>
                updateQuestion(currentIndex, {
                  options: { wordCloud: checked },
                })
              }
            />
          }
        />
        <ConfigField.Description>
          {t("quizz:question.config.wordCloudHint")}
        </ConfigField.Description>
      </ConfigField>

      <BaseConfig />
    </>
  )
}

export default TextConfig
