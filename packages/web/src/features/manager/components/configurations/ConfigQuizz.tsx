import type { QuizzValidated } from "@razzia/common/validators/quizz"
import AlertDialog from "@razzia/web/components/AlertDialog"
import Button from "@razzia/web/components/Button"
import { SkeletonRows } from "@razzia/web/components/Skeleton"
import ConfigActiveGame from "@razzia/web/features/manager/components/configurations/ConfigActiveGame"
import {
  activeGameQuery,
  createQuizz,
  deleteQuizz,
  quizzKeys,
  quizzListQuery,
} from "@razzia/web/features/manager/queries"
import { useStartGame } from "@razzia/web/features/manager/useStartGame"
import { api, ApiError, unwrap } from "@razzia/web/lib/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Download, Link2, Play, SquarePen, Trash2, Upload } from "lucide-react"
import { type ChangeEvent, useRef } from "react"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const ROW_ACTION =
  "text-accent-foreground hover:bg-accent-foreground/10 rounded-sm p-2"

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")

  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}

const ConfigQuizz = () => {
  const { data, isPending } = useQuery(quizzListQuery())
  const { data: activeData, isPending: isActivePending } =
    useQuery(activeGameQuery())
  const { mutate: start, isPending: isStarting } = useStartGame()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: quizzKeys.all })

  const onError = (error: Error, fallback: string) => {
    toast.error(t(error instanceof ApiError ? error.key : fallback))
  }

  const { mutate: remove } = useMutation({
    mutationFn: deleteQuizz,
    onSuccess: () => {
      invalidate()
      toast.success(t("manager:quizz.deleted"))
    },
    onError: (error) => onError(error, "errors:quizz.failedToDelete"),
  })

  const { mutate: importQuizz } = useMutation({
    mutationFn: createQuizz,
    onSuccess: () => {
      invalidate()
      toast.success(t("quizz:quizzSaved"))
    },
    onError: (error) => onError(error, "errors:quizz.failedToSave"),
  })

  const handleExport = (id: string) => async () => {
    try {
      const { id: _id, ...quizz } = await unwrap(
        api.quizz[":id"].$get({ param: { id } }),
      )

      downloadJson(quizz, `${quizz.subject}.json`)
    } catch (error) {
      onError(error as Error, "errors:quizz.notFound")
    }
  }

  const handleCopyLink = (id: string) => async () => {
    const link = new URL(`/q/${id}`, window.location.origin).href

    try {
      await navigator.clipboard.writeText(link)
      toast.success(t("manager:quizz.linkCopied"))
    } catch {
      // The clipboard API only exists on secure origins.
      toast.error(t("manager:quizz.linkCopyFailed", { link }))
    }
  }

  const handleImport = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        importQuizz(
          JSON.parse(event.target?.result as string) as QuizzValidated,
        )
      } catch {
        toast.error("Invalid JSON file")
      }
    }

    reader.readAsText(file)
    e.target.value = ""
  }

  const quizz = data?.quizz ?? []
  const activeGame = activeData?.game ?? null
  const canStart = !isActivePending && !activeGame

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {activeGame && <ConfigActiveGame game={activeGame} />}

      <div className="mb-4 flex shrink-0 gap-2">
        <Button
          className="flex-1"
          onClick={() => navigate({ to: "/manager/quizz" })}
        >
          {t("manager:quizz.create")}
        </Button>
        <Button
          className="bg-accent text-accent-foreground aspect-square px-3"
          onClick={() => fileInputRef.current?.click()}
          title={t("manager:quizz.import")}
        >
          <Upload className="size-4" />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImport}
        />
      </div>

      <ul className="min-h-0 flex-1 space-y-2 overflow-auto p-0.5">
        {isPending && <SkeletonRows className="h-12" />}

        {quizz.map((q) => (
          <li
            key={q.id}
            className="border-accent flex h-12 w-full items-center justify-between gap-2 rounded-md border-2 p-3 pr-1.5"
          >
            <p className="text-foreground min-w-0 truncate font-medium">
              {q.subject}
            </p>
            <div className="flex shrink-0 gap-0.5">
              {canStart && (
                <button
                  className="text-primary hover:bg-primary/10 rounded-sm p-2 disabled:opacity-50"
                  title={t("manager:quizz.startGame")}
                  disabled={isStarting}
                  onClick={() => start(q.id)}
                >
                  <Play className="size-4" />
                </button>
              )}

              <button
                className={ROW_ACTION}
                title={t("manager:quizz.copyLink")}
                onClick={() => handleCopyLink(q.id)()}
              >
                <Link2 className="size-4" />
              </button>

              <button
                className={ROW_ACTION}
                title={t("manager:quizz.edit")}
                onClick={() =>
                  navigate({
                    to: "/manager/quizz/$quizzId",
                    params: { quizzId: q.id },
                  })
                }
              >
                <SquarePen className="size-4" />
              </button>

              <button
                className={ROW_ACTION}
                onClick={() => handleExport(q.id)()}
                title={t("manager:quizz.export")}
              >
                <Download className="size-4" />
              </button>

              <AlertDialog
                trigger={
                  <button
                    className="rounded-sm p-2 hover:bg-red-600/10"
                    title={t("manager:quizz.delete")}
                  >
                    <Trash2 className="size-4 stroke-red-500" />
                  </button>
                }
                title={t("manager:quizz.delete")}
                description={t("manager:quizz.deleteConfirm", {
                  name: q.subject,
                })}
                confirmLabel={t("common:delete")}
                onConfirm={() => remove(q.id)}
              />
            </div>
          </li>
        ))}
        {!isPending && quizz.length === 0 && (
          <li className="text-muted-foreground my-8 text-center">
            {t("manager:quizz.none")}
          </li>
        )}
      </ul>
    </div>
  )
}

export default ConfigQuizz
