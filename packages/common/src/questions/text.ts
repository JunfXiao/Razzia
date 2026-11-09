/** Answer id stored for a text answer that matches no accepted answer. */
export const TEXT_NO_MATCH = -1

/** Ignores case, surrounding and repeated spaces, and full-width variants. */
export const normalizeTextAnswer = (value: string): string =>
  value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLowerCase()

/** Index of the accepted answer `value` matches, or `TEXT_NO_MATCH`. */
export const matchTextAnswer = (value: string, accepted: string[]): number => {
  const normalized = normalizeTextAnswer(value)

  return accepted.findIndex(
    (answer) => normalizeTextAnswer(answer) === normalized,
  )
}
