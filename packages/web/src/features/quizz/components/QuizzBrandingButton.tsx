import { ACCEPTED_MEDIA_TYPES, MEDIA_TYPES } from "@razzia/common/constants"
import type { UploadedMedia } from "@razzia/common/types/game"
import Button from "@razzia/web/components/Button"
import Loader from "@razzia/web/components/Loader"
import MediaLibrary from "@razzia/web/features/quizz/components/QuestionEditor/MediaLibrary"
import type { QuizzFormValues } from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { useUploadMedia } from "@razzia/web/features/quizz/hooks/useUploadMedia"
import { ImageOff, Library, Upload, X } from "lucide-react"
import { Dialog } from "radix-ui"
import { type ChangeEvent, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const IMAGE_ACCEPT = Object.entries(ACCEPTED_MEDIA_TYPES)
  .filter(([, { type }]) => type === MEDIA_TYPES.IMAGE)
  .flatMap(([mime, { ext }]) => [mime, ext])
  .join(",")

const FIELDS = [
  { name: "background", labelKey: "quizz:branding.background" },
  { name: "logo", labelKey: "quizz:branding.logo" },
] as const

const BrandingField = ({ name, labelKey }: (typeof FIELDS)[number]) => {
  const { control, setValue } = useFormContext<QuizzFormValues>()
  const value = useWatch({ control, name: `branding.${name}` })
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const { t } = useTranslation()

  const setUrl = (url: string | undefined) =>
    setValue(`branding.${name}`, url, { shouldDirty: true })

  const pick = ({ type, url }: UploadedMedia) => {
    if (type !== MEDIA_TYPES.IMAGE) {
      toast.error(t("errors:quizz.invalidMediaUrl"))

      return
    }

    setUrl(url)
  }

  const { upload, pendingCount } = useUploadMedia(pick)

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    upload(Array.from(e.target.files ?? []))
    e.target.value = ""
  }

  return (
    <div className="flex items-center gap-4">
      <div className="bg-muted flex h-24 w-40 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {value ? (
          <img src={value} alt="" className="size-full object-contain" />
        ) : (
          <ImageOff className="text-muted-foreground size-8" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-foreground font-semibold">{t(labelKey)}</p>
        <div className="flex flex-wrap gap-2">
          <label className="bg-primary flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-semibold text-white">
            {pendingCount > 0 ? (
              <Loader className="size-4 text-white" />
            ) : (
              <Upload className="size-4" />
            )}
            {t("quizz:media.upload")}
            <input
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              onChange={handleUpload}
            />
          </label>
          <Button
            size="sm"
            className="bg-accent text-accent-foreground flex items-center gap-1.5"
            onClick={() => setIsLibraryOpen(true)}
          >
            <Library className="size-4" />
            {t("quizz:media.library")}
          </Button>
          {value && (
            <Button
              size="sm"
              className="bg-accent text-accent-foreground"
              onClick={() => setUrl(undefined)}
            >
              {t("common:delete")}
            </Button>
          )}
        </div>
      </div>

      <MediaLibrary
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onPick={pick}
      />
    </div>
  )
}

const QuizzBrandingButton = () => {
  const { t } = useTranslation()

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button className="text-md bg-accent text-accent-foreground px-4 py-2 font-semibold">
          {t("quizz:branding.title")}
        </Button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70" />
        <Dialog.Content
          aria-describedby={undefined}
          className="bg-background fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl p-6"
        >
          <Dialog.Title className="text-foreground text-xl font-bold">
            {t("quizz:branding.title")}
          </Dialog.Title>
          <Dialog.Close
            aria-label={t("common:close")}
            className="hover:bg-muted absolute top-4 right-4 rounded-full p-1.5"
          >
            <X className="text-foreground size-6" />
          </Dialog.Close>

          {FIELDS.map((field) => (
            <BrandingField key={field.name} {...field} />
          ))}

          <p className="text-muted-foreground text-sm">
            {t("quizz:branding.hint")}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default QuizzBrandingButton
