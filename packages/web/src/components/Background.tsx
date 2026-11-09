import { getAppConfig } from "@razzia/web/app-config"
import defaultLogo from "@razzia/web/assets/logo.svg"
import { getAppName, getBranding, imageFallback } from "@razzia/web/branding"
import GithubIcon from "@razzia/web/components/GithubIcon"
import { useGameBrandingStore } from "@razzia/web/features/game/stores/branding"
import type { PropsWithChildren } from "react"

const Background = ({ children }: PropsWithChildren) => {
  const branding = getBranding()
  const { branding: gameBranding } = useGameBrandingStore()
  const logo = gameBranding?.logo ?? branding?.logo ?? defaultLogo
  const background = gameBranding?.background
  const backgroundColor = gameBranding?.backgroundColor
  const logoText = gameBranding?.logo ? undefined : gameBranding?.logoText
  const appName = getAppName()
  const footerText = getAppConfig()?.footerText

  return (
    <section
      className="relative flex min-h-dvh flex-col items-center justify-center bg-cover bg-center"
      style={
        background
          ? { backgroundImage: `url(${JSON.stringify(background)})` }
          : { backgroundColor }
      }
    >
      <div
        className="absolute h-full max-h-svh w-full overflow-hidden"
        hidden={Boolean(background ?? backgroundColor)}
      >
        <div className="bg-primary/15 absolute top-[-70vmin] left-[-50vmin] min-h-[120vmin] min-w-[120vmin] rotate-20 rounded-4xl" />
        <div className="bg-primary/15 absolute right-[-10vmin] bottom-[-45vmin] min-h-[75vmin] min-w-[75vmin] rotate-20 rounded-4xl" />
      </div>

      {logoText ? (
        <h1 className="relative mb-10 text-5xl font-bold text-white drop-shadow-lg">
          {logoText}
        </h1>
      ) : (
        <img
          src={logo}
          onError={imageFallback(defaultLogo)}
          className="mb-10 h-16"
          alt={appName}
        />
      )}
      {children}

      <footer className="pointer-events-none absolute inset-x-0 bottom-4 flex flex-col items-center gap-1 px-4 text-center text-sm font-semibold text-white/50 *:pointer-events-auto">
        <a
          href="https://github.com/Ralex91/Razzia"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 transition-colors hover:text-white/80"
        >
          <GithubIcon size={14} />
          {/* oxlint-disable-next-line no-undef */}
          Razzia - v{__APP_VERSION__}
        </a>
        {footerText && (
          <p className="max-w-full text-xs wrap-break-word">{footerText}</p>
        )}
      </footer>
    </section>
  )
}

export default Background
