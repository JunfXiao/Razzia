import defaultBackground from "@razzia/web/assets/background.png"
import { getBranding, imageFallback } from "@razzia/web/branding"
import { useGameBrandingStore } from "@razzia/web/features/game/stores/branding"
import clsx from "clsx"
import { useState } from "react"

const GameBackground = () => {
  const { branding } = useGameBrandingStore()
  const [loaded, setLoaded] = useState<string | null>(null)
  const custom = branding?.background
  const background = custom ?? getBranding()?.background ?? defaultBackground

  return (
    <div className="bg-secondary fixed top-0 left-0 h-full w-full">
      <img
        className={clsx(
          "pointer-events-none h-full w-full object-cover select-none",
          custom && loaded !== custom && "opacity-0",
        )}
        src={background}
        onLoad={() => setLoaded(background)}
        onError={imageFallback(defaultBackground)}
        alt="background"
      />
    </div>
  )
}

export default GameBackground
