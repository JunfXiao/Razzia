import useSound from "use-sound"
import { useGameBrandingStore } from "../stores/branding"


/// export default function useSound<T = any>(src: string | string[], { id, volume, playbackRate, soundEnabled, interrupt, onload, ...delegated }?: HookOptions<T>): ReturnedValue;

export const useBrandingSound = <T = any>(src: Parameters<typeof useSound<T>>[0], options?: Parameters<typeof useSound<T>>[1]) => {
  const branding = useGameBrandingStore()

  const sound = useSound(src, {
    ...options,
    soundEnabled: (branding.branding?.playSoundEffects ?? false) && (options?.soundEnabled ?? true),
  })

  return sound
}