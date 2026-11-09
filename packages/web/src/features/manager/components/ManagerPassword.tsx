import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile"
import type { ManagerLogin } from "@razzia/common/validators/auth"
import Button from "@razzia/web/components/Button"
import Card from "@razzia/web/components/Card"
import Input from "@razzia/web/components/Input"
import { authConfigQuery } from "@razzia/web/features/manager/queries"
import { useQuery } from "@tanstack/react-query"
import { type KeyboardEvent, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

interface Props {
  onSubmit: (_credentials: ManagerLogin) => void
  disabled?: boolean
}

const ManagerPassword = ({ onSubmit, disabled }: Props) => {
  const [password, setPassword] = useState("")
  const [turnstileToken, setTurnstileToken] = useState<string>()
  const turnstile = useRef<TurnstileInstance>(null)
  const { data: config } = useQuery(authConfigQuery())
  const { t, i18n } = useTranslation()
  const siteKey = config?.turnstileSiteKey
  const isVerifying = !config || (Boolean(siteKey) && !turnstileToken)

  const clearToken = () => setTurnstileToken(undefined)

  const handleSubmit = () => {
    if (disabled || isVerifying) {
      return
    }

    onSubmit({ password, turnstileToken })

    // A token works only once, so every attempt needs a new one.
    if (siteKey) {
      clearToken()
      turnstile.current?.reset()
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit()
    }
  }

  return (
    <Card className="max-w-88">
      <Input
        type="password"
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t("manager:passwordPlaceholder")}
      />
      {siteKey && (
        <Turnstile
          ref={turnstile}
          className="mt-4"
          siteKey={siteKey}
          options={{ language: i18n.language }}
          onSuccess={setTurnstileToken}
          onExpire={clearToken}
          onError={clearToken}
        />
      )}
      <Button className="mt-4" onClick={handleSubmit} disabled={isVerifying}>
        {t("common:submit")}
      </Button>
    </Card>
  )
}

export default ManagerPassword
