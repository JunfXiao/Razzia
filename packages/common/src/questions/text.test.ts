import {
  matchTextAnswer,
  normalizeTextAnswer,
  TEXT_NO_MATCH,
} from "@razzia/common/questions/text"
import { describe, expect, it } from "vitest"

describe("normalizeTextAnswer", () => {
  it("ignores case and extra spaces", () => {
    expect(normalizeTextAnswer("  New   YORK ")).toBe("new york")
  })

  it("folds full-width characters", () => {
    expect(normalizeTextAnswer("ＡＢＣ１２３")).toBe("abc123")
  })
})

describe("matchTextAnswer", () => {
  it("returns the index of the matching accepted answer", () => {
    expect(matchTextAnswer(" paris ", ["Lyon", "Paris"])).toBe(1)
  })

  it("reports answers that match nothing", () => {
    expect(matchTextAnswer("Pariss", ["Paris"])).toBe(TEXT_NO_MATCH)
  })
})
