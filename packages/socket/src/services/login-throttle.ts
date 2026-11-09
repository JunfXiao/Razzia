import { loginMaxFailures } from "@razzia/socket/env"

const WINDOW_MS = 15 * 60 * 1000
const MAX_TRACKED_CLIENTS = 10_000

interface Failures {
  count: number
  expiresAt: number
}

const failures = new Map<string, Failures>()

const currentFailures = (client: string): Failures | undefined => {
  const entry = failures.get(client)

  if (entry && entry.expiresAt <= Date.now()) {
    failures.delete(client)

    return undefined
  }

  return entry
}

/** Seconds until `client` may try again, or 0 when it is not locked out. */
export const loginRetryAfter = (client: string): number => {
  const entry = currentFailures(client)

  return entry && loginMaxFailures > 0 && entry.count >= loginMaxFailures
    ? Math.ceil((entry.expiresAt - Date.now()) / 1000)
    : 0
}

export const recordLoginFailure = (client: string): void => {
  if (loginMaxFailures === 0) {
    return
  }

  const entry = currentFailures(client)

  if (entry) {
    entry.count += 1

    return
  }

  if (failures.size >= MAX_TRACKED_CLIENTS) {
    // A Map iterates in insertion order, so this is the oldest entry.
    const [oldest] = failures.keys()

    failures.delete(oldest)
  }

  failures.set(client, { count: 1, expiresAt: Date.now() + WINDOW_MS })
}

export const clearLoginFailures = (client: string): void => {
  failures.delete(client)
}
