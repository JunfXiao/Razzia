import { api, ApiError, unwrap } from "@razzia/web/lib/api"
import { getToken, setToken } from "@razzia/web/lib/session"
import { StatusCodes } from "http-status-codes"
import { afterEach, describe, expect, it, vi } from "vitest"

const tokenFor = (sub: string) => {
  const exp = Math.floor(Date.now() / 1000) + 3600
  const payload = btoa(JSON.stringify({ sub, role: "player", exp }))

  return `header.${payload}.signature`
}

const STALE_TOKEN = tokenFor("stale")
const FRESH_TOKEN = tokenFor("fresh")

const json = (body: unknown, status: number = StatusCodes.OK) =>
  new Response(JSON.stringify(body), { status })

const stubFetch = (gameStatuses: number[]) => {
  const authorizations: Array<string | null> = []
  const remaining = [...gameStatuses]

  vi.stubGlobal(
    "fetch",
    vi.fn((input: string, init?: RequestInit) => {
      if (input.includes("/auth/session")) {
        return Promise.resolve(json({ token: FRESH_TOKEN, clientId: "fresh" }))
      }

      authorizations.push(new Headers(init?.headers).get("Authorization"))

      return Promise.resolve(json({ gameId: "1" }, remaining.shift()))
    }),
  )

  return authorizations
}

const join = () =>
  unwrap(
    api.games.join.$post({ json: { inviteCode: "123456", username: "A" } }),
  )

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("authenticated requests", () => {
  it("replaces a rejected session and retries once", async () => {
    setToken(STALE_TOKEN)

    const authorizations = stubFetch([StatusCodes.UNAUTHORIZED, StatusCodes.OK])

    await expect(join()).resolves.toEqual({ gameId: "1" })
    expect(authorizations).toEqual([
      `Bearer ${STALE_TOKEN}`,
      `Bearer ${FRESH_TOKEN}`,
    ])
  })

  it("reports the failure when the new session is rejected too", async () => {
    setToken(STALE_TOKEN)
    stubFetch([StatusCodes.UNAUTHORIZED, StatusCodes.UNAUTHORIZED])

    await expect(join()).rejects.toBeInstanceOf(ApiError)
    expect(getToken()).toBeNull()
  })
})
