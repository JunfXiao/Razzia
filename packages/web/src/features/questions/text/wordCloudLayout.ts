import cloud from "d3-cloud"

export const LAYOUT_WIDTH = 960

export const LAYOUT_HEIGHT = 480

const MIN_FONT_SIZE = 20
const FONT_SIZE_RANGE = 76
const PADDING = 5
const SHRINK_FACTOR = 0.85
const MAX_ATTEMPTS = 8
const VIEW_MARGIN = 8
const ROTATE_EVERY = 3
// Rotating a long phrase would need most of the height for a single word.
const MAX_ROTATED_LENGTH = 10

export interface CloudInput {
  text: string
  count: number
}

export interface PlacedWord extends CloudInput {
  x: number
  y: number
  size: number
  rotate: number
}

export interface CloudLayout {
  words: PlacedWord[]
  viewBox: string
}

/** Same answer, same orientation, so reviewing a reveal shows the same cloud. */
const hashText = (text: string) =>
  Array.from(text).reduce(
    (hash, char) => (Math.imul(hash, 31) + (char.codePointAt(0) ?? 0)) >>> 0,
    7,
  )

export const rotationOf = (text: string, index: number): number => {
  if (index === 0 || Array.from(text).length > MAX_ROTATED_LENGTH) {
    return 0
  }

  return hashText(text) % ROTATE_EVERY === 0 ? 90 : 0
}

/** Deterministic random source (mulberry32) for repeatable placement. */
export const seededRandom = (seed: number) => {
  let state = seed

  return () => {
    state = (state + 0x6d2b79f5) >>> 0

    let t = state

    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface LayoutOptions {
  fontFamily: string
  onDone: (_layout: CloudLayout) => void
}

/** Runs the layout, shrinking the text until every answer fits. Returns a cancel function. */
export const layoutWordCloud = (
  responses: CloudInput[],
  { fontFamily, onDone }: LayoutOptions,
): (() => void) => {
  const maxCount = Math.max(1, ...responses.map(({ count }) => count))
  const sorted = [...responses].sort((a, b) => b.count - a.count)
  const seed = hashText(sorted.map(({ text }) => text).join("|"))
  let cancelled = false
  let current: { stop: () => void } | null = null

  const attempt = (scale: number, remaining: number) => {
    const layout = cloud<PlacedWord>()
      .size([LAYOUT_WIDTH, LAYOUT_HEIGHT])
      .words(
        sorted.map(({ text, count }, index) => ({
          text,
          count,
          x: 0,
          y: 0,
          size: (MIN_FONT_SIZE + (count / maxCount) * FONT_SIZE_RANGE) * scale,
          rotate: rotationOf(text, index),
        })),
      )
      .padding(PADDING)
      .rotate((word) => word.rotate)
      .font(fontFamily)
      .fontWeight(700)
      .fontSize((word) => word.size)
      .spiral("archimedean")
      .random(seededRandom(seed))
      .on("end", (words, bounds) => {
        if (cancelled) {
          return
        }

        if (words.length < sorted.length && remaining > 0) {
          attempt(scale * SHRINK_FACTOR, remaining - 1)

          return
        }

        const [min, max] = bounds
        const left = min.x - LAYOUT_WIDTH / 2 - VIEW_MARGIN
        const top = min.y - LAYOUT_HEIGHT / 2 - VIEW_MARGIN

        onDone({
          words,
          viewBox: `${left} ${top} ${max.x - min.x + 2 * VIEW_MARGIN} ${max.y - min.y + 2 * VIEW_MARGIN}`,
        })
      })

    current = layout
    layout.start()
  }

  attempt(1, MAX_ATTEMPTS)

  return () => {
    cancelled = true
    current?.stop()
  }
}
