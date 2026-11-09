import type { AppConfig } from "@razzia/common/types/config"
import { z } from "zod"

const appConfigSchema = z.object({
  appName: z.string().nullable(),
  footerText: z.string().nullable(),
}) satisfies z.ZodType<AppConfig>

let current: AppConfig | null = null

/** The instance settings from the server environment, once loaded. */
export const getAppConfig = (): AppConfig | null => current

export const loadAppConfig = async (): Promise<AppConfig | null> => {
  try {
    const response = await fetch("/api/config", {
      cache: "no-cache",
      signal: AbortSignal.timeout(2000),
    })

    if (!response.ok) {
      return null
    }

    const parsed = appConfigSchema.safeParse(await response.json())
    current = parsed.success ? parsed.data : null

    return current
  } catch {
    return null
  }
}
