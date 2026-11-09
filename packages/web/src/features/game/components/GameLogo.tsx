import { useGameBrandingStore } from "@razzia/web/features/game/stores/branding"
import { twMerge } from "tailwind-merge"

interface Props {
  className?: string
}

const GameLogo = ({ className }: Props) => {
  const { branding } = useGameBrandingStore()

  if (branding?.logo) {
    return (
      <img
        src={branding.logo}
        alt=""
        className={twMerge("h-10 object-contain md:h-14", className)}
      />
    )
  }

  if (branding?.logoText) {
    return (
      <span
        className={twMerge(
          "max-w-[50vw] truncate text-2xl font-bold text-white drop-shadow-lg md:text-4xl",
          className,
        )}
      >
        {branding.logoText}
      </span>
    )
  }

  return null
}

export default GameLogo
