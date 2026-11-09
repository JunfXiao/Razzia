const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
const VERIFY_TIMEOUT_MS = 5000

/** Fails closed: an unreachable Cloudflare counts as a failed check. */
export const verifyTurnstileToken = async (
  secret: string,
  response: string,
): Promise<boolean> => {
  try {
    const result = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response }),
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    })
    const { success } = (await result.json()) as { success?: boolean }

    return success === true
  } catch (error) {
    console.warn("Turnstile verification failed:", error)

    return false
  }
}
