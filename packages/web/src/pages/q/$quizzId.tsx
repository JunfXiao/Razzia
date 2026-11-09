import { SESSION_ROLES } from "@razzia/common/constants"
import Background from "@razzia/web/components/Background"
import Card from "@razzia/web/components/Card"
import LanguageSwitcher from "@razzia/web/components/LanguageSwitcher"
import Loader from "@razzia/web/components/Loader"
import NotFound from "@razzia/web/components/NotFound"
import { useGameBrandingStore } from "@razzia/web/features/game/stores/branding"
import ManagerPassword from "@razzia/web/features/manager/components/ManagerPassword"
import {
  isNotFoundError,
  managerLogin,
  quizzLandingQuery,
} from "@razzia/web/features/manager/queries"
import { useStartGame } from "@razzia/web/features/manager/useStartGame"
import { ApiError } from "@razzia/web/lib/api"
import { getRole, setToken } from "@razzia/web/lib/session"
import { useMutation, useQuery } from "@tanstack/react-query"
import { createFileRoute, Navigate } from "@tanstack/react-router"
import { Play } from "lucide-react"
import { Dialog } from "radix-ui"
import { useLayoutEffect, useState } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const QuizzLandingPage = () => {
  const { quizzId } = Route.useParams()
  const { data, error } = useQuery(quizzLandingQuery(quizzId))
  const { setBranding } = useGameBrandingStore()
  const { mutate: start, isPending: isStarting } = useStartGame()
  const [askPassword, setAskPassword] = useState(false)
  const { t } = useTranslation()

  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: managerLogin,
    onSuccess: (session) => {
      setToken(session.token)
      setAskPassword(false)
      start(quizzId)
    },
    onError: (loginError) => {
      toast.error(
        t(
          loginError instanceof ApiError
            ? loginError.key
            : "errors:route.description",
        ),
      )
    },
  })

  const branding = data?.branding

  // Applied before paint so the default background never flashes. It stays set
  // on leaving, so the PIN page keeps the look of the quizz.
  useLayoutEffect(() => {
    if (branding !== undefined) {
      setBranding(branding)
    }
  }, [branding, setBranding])

  const handleHostStart = () => {
    if (getRole() === SESSION_ROLES.MANAGER) {
      start(quizzId)
    } else {
      setAskPassword(true)
    }
  }

  if (isNotFoundError(error)) {
    return <NotFound />
  }

  if (!data) {
    return <div className="min-h-dvh" />
  }

  if (data.active) {
    return <Navigate to="/" replace />
  }

  return (
    <Background>
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <Card className="items-center gap-3 text-center">
        <h2 className="text-foreground w-full text-xl font-bold wrap-break-word">
          {data.subject}
        </h2>
        <Loader className="text-primary size-8" />
        <p className="text-muted-foreground font-semibold">
          {t("game:landing.waiting")}
        </p>
      </Card>

      <button
        className="absolute right-4 bottom-4 z-10 flex items-center gap-1.5 rounded-md bg-black/30 px-3 py-1.5 text-sm font-semibold text-white/80 transition-colors hover:bg-black/50 hover:text-white disabled:opacity-50"
        disabled={isStarting}
        onClick={handleHostStart}
      >
        <Play className="size-3.5" />
        {t("game:landing.hostStart")}
      </button>

      <Dialog.Root open={askPassword} onOpenChange={setAskPassword}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-80 -translate-x-1/2 -translate-y-1/2 flex-col"
          >
            <Dialog.Title className="mb-3 text-center text-lg font-bold text-white">
              {t("game:landing.passwordTitle")}
            </Dialog.Title>
            <ManagerPassword
              onSubmit={login}
              disabled={isLoggingIn || isStarting}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Background>
  )
}

export const Route = createFileRoute("/q/$quizzId")({
  component: QuizzLandingPage,
})
