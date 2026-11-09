import {
  ACCEPTED_MEDIA_TYPES,
  MAX_LOGO_TEXT_LENGTH,
  MEDIA_TYPES,
} from "@razzia/common/constants"
import type { UploadedMedia } from "@razzia/common/types/game"
import Button from "@razzia/web/components/Button"
import Input from "@razzia/web/components/Input"
import Loader from "@razzia/web/components/Loader"
import ToggleGroup from "@razzia/web/components/ToggleGroup"
import MediaLibrary from "@razzia/web/features/quizz/components/QuestionEditor/MediaLibrary"
import type { QuizzFormValues } from "@razzia/web/features/quizz/contexts/quizz-editor-context"
import { useUploadMedia } from "@razzia/web/features/quizz/hooks/useUploadMedia"
import { ImageOff, Library, Upload } from "lucide-react"
import { type ChangeEvent, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { useTranslation } from "react-i18next"

const IMAGE_ACCEPT = Object.entries(ACCEPTED_MEDIA_TYPES)
  .filter(([, { type }]) => type === MEDIA_TYPES.IMAGE)
  .flatMap(([mime, { ext }]) => [mime, ext])
  .join(",")

const DEFAULT_COLOR = "#1f2937"

type BrandingKey = keyof NonNullable<QuizzFormValues["branding"]>

const useSetBranding = () => {
  const { setValue } = useFormContext<QuizzFormValues>()

  return (name: BrandingKey, value: string | undefined) =>
    setValue(`branding.${name}`, value, { shouldDirty: true })
}

const ImagePicker = ({ name }: { name: "background" | "logo" }) => {
  const { control } = useFormContext<QuizzFormValues>()
  const value = useWatch({ control, name: `branding.${name}` })
  const setBranding = useSetBranding()
  const [isLibraryOpen, setIsLibraryOpen] = useState(false)
  const { t } = useTranslation()

  const pick = ({ type, url }: UploadedMedia) => {
    if (type !== MEDIA_TYPES.IMAGE) {
      toast.error(t("errors:quizz.invalidMediaUrl"))

      return
    }

    setBranding(name, url)
  }

  const { upload, pendingCount } = useUploadMedia(pick)

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    upload(Array.from(e.target.files ?? []))
    e.target.value = ""
  }

  return (
    <div className="flex items-center gap-3">
      <div className="bg-muted flex h-16 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {value ? (
          <img src={value} alt="" className="size-full object-contain" />
        ) : (
          <ImageOff className="text-muted-foreground size-6" />
        )}
      </div>

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
          type="button"
          size="sm"
          className="bg-accent text-accent-foreground flex items-center gap-1.5"
          onClick={() => setIsLibraryOpen(true)}
        >
          <Library className="size-4" />
          {t("quizz:media.library")}
        </Button>
      </div>

      <MediaLibrary
        open={isLibraryOpen}
        onOpenChange={setIsLibraryOpen}
        onPick={pick}
      />
    </div>
  )
}

type BackgroundMode = "none" | "color" | "image"

const BackgroundField = () => {
  const { control } = useFormContext<QuizzFormValues>()
  const [image, color] = useWatch({
    control,
    name: ["branding.background", "branding.backgroundColor"],
  })
  const setBranding = useSetBranding()
  const [mode, setMode] = useState<BackgroundMode>(() => {
    if (image) {
      return "image"
    }

    return color ? "color" : "none"
  })
  const { t } = useTranslation()

  const changeMode = (next: BackgroundMode) => {
    setMode(next)
    setBranding("backgroundColor", next === "color" ? DEFAULT_COLOR : undefined)

    if (next !== "image") {
      setBranding("background", undefined)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground font-semibold">
          {t("quizz:branding.background")}
        </p>
        <ToggleGroup
          value={mode}
          onChange={changeMode}
          items={[
            { value: "none", label: t("quizz:branding.none") },
            { value: "color", label: t("quizz:branding.color") },
            { value: "image", label: t("quizz:branding.image") },
          ]}
        />
      </div>

      {mode === "color" && (
        <label className="flex items-center gap-3">
          <input
            type="color"
            value={color ?? DEFAULT_COLOR}
            onChange={(e) => setBranding("backgroundColor", e.target.value)}
            aria-label={t("quizz:branding.color")}
            className="h-10 w-16 cursor-pointer rounded"
          />
          <span className="text-muted-foreground font-mono text-sm">
            {color}
          </span>
        </label>
      )}

      {mode === "image" && <ImagePicker name="background" />}
    </div>
  )
}

type LogoMode = "none" | "text" | "image"

const LogoField = () => {
  const { control } = useFormContext<QuizzFormValues>()
  const [image, text] = useWatch({
    control,
    name: ["branding.logo", "branding.logoText"],
  })
  const setBranding = useSetBranding()
  const [mode, setMode] = useState<LogoMode>(() => {
    if (image) {
      return "image"
    }

    return text ? "text" : "none"
  })
  const { t } = useTranslation()

  const changeMode = (next: LogoMode) => {
    setMode(next)

    if (next !== "text") {
      setBranding("logoText", undefined)
    }

    if (next !== "image") {
      setBranding("logo", undefined)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <p className="text-foreground font-semibold">
          {t("quizz:branding.logo")}
        </p>
        <ToggleGroup
          value={mode}
          onChange={changeMode}
          items={[
            { value: "none", label: t("quizz:branding.none") },
            { value: "text", label: t("quizz:branding.text") },
            { value: "image", label: t("quizz:branding.image") },
          ]}
        />
      </div>

      {mode === "text" && (
        <Input
          variant="sm"
          value={text ?? ""}
          maxLength={MAX_LOGO_TEXT_LENGTH}
          placeholder={t("quizz:branding.logoTextPlaceholder")}
          onChange={(e) => setBranding("logoText", e.target.value || undefined)}
        />
      )}

      {mode === "image" && <ImagePicker name="logo" />}
    </div>
  )
}

const BrandingFields = () => {
  const { t } = useTranslation()

  return (
    <>
      <BackgroundField />
      <LogoField />
      <p className="text-muted-foreground text-sm">
        {t("quizz:branding.hint")}
      </p>
    </>
  )
}

export default BrandingFields
