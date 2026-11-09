import { zValidator } from "@hono/zod-validator"
import { SESSION_ROLES } from "@razzia/common/constants"
import type { SessionResponse } from "@razzia/common/types/auth"
import {
  managerLoginValidator,
  sessionRequestValidator,
} from "@razzia/common/validators/auth"
import { clientAddress } from "@razzia/socket/api/client-address"
import { readClaims } from "@razzia/socket/api/middleware"
import { i18nHook } from "@razzia/socket/api/validation"
import {
  managerPassword,
  turnstileSecretKey,
  turnstileSiteKey,
} from "@razzia/socket/env"
import {
  mintToken,
  newClientId,
  verifyIgnoringExpiry,
  verifyToken,
} from "@razzia/socket/services/auth"
import {
  clearLoginFailures,
  loginRetryAfter,
  recordLoginFailure,
} from "@razzia/socket/services/login-throttle"
import { verifyTurnstileToken } from "@razzia/socket/services/turnstile"
import { createHash, timingSafeEqual } from "crypto"
import { Hono, type Context } from "hono"
import { JwtTokenExpired } from "hono/utils/jwt/types"
import { StatusCodes } from "http-status-codes"

const readRequestToken = async (c: Context): Promise<string | undefined> => {
  try {
    const result = sessionRequestValidator.safeParse(await c.req.json())

    if (result.success && result.data.token) {
      return result.data.token
    }
  } catch {
    /* Empty */
  }

  const header = c.req.header("Authorization")

  return header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : undefined
}

const digest = (value: string) => createHash("sha256").update(value).digest()

const passwordMatches = (candidate: string, expected: string) =>
  timingSafeEqual(digest(candidate), digest(expected))

const freshPlayerSession = (): Promise<SessionResponse> =>
  mintToken(newClientId(), SESSION_ROLES.PLAYER)

const routes = new Hono()
  .get("/config", (c) => c.json({ turnstileSiteKey: turnstileSiteKey ?? null }))
  .post("/session", async (c) => {
    const token = await readRequestToken(c)

    if (!token) {
      return c.json(await freshPlayerSession())
    }

    try {
      const claims = await verifyToken(token)

      return c.json({
        token,
        clientId: claims.sub,
        role: claims.role,
        expiresAt: claims.exp,
      } satisfies SessionResponse)
    } catch (error) {
      if (error instanceof JwtTokenExpired) {
        try {
          const claims = await verifyIgnoringExpiry(token)

          return c.json(await mintToken(claims.sub, SESSION_ROLES.PLAYER))
        } catch {
          /* Empty */
        }
      }

      return c.json(await freshPlayerSession())
    }
  })
  .post(
    "/manager",
    zValidator("json", managerLoginValidator, i18nHook),
    async (c) => {
      const { password, turnstileToken } = c.req.valid("json")

      if (!managerPassword) {
        return c.json(
          { error: "errors:manager.passwordNotConfigured" },
          StatusCodes.FORBIDDEN,
        )
      }

      const client = clientAddress(c)
      const retryAfter = loginRetryAfter(client)

      if (retryAfter > 0) {
        c.header("Retry-After", String(retryAfter))

        return c.json(
          { error: "errors:manager.tooManyAttempts" },
          StatusCodes.TOO_MANY_REQUESTS,
        )
      }

      if (
        turnstileSecretKey &&
        !(
          turnstileToken &&
          (await verifyTurnstileToken(turnstileSecretKey, turnstileToken))
        )
      ) {
        return c.json(
          { error: "errors:manager.verificationFailed" },
          StatusCodes.FORBIDDEN,
        )
      }

      if (!passwordMatches(password, managerPassword)) {
        recordLoginFailure(client)

        return c.json(
          { error: "errors:manager.invalidPassword" },
          StatusCodes.FORBIDDEN,
        )
      }

      clearLoginFailures(client)

      const claims = await readClaims(c)

      return c.json(
        await mintToken(claims?.sub ?? newClientId(), SESSION_ROLES.MANAGER),
      )
    },
  )
  .post("/logout", async (c) => {
    const claims = await readClaims(c)

    if (!claims) {
      return c.json(
        { error: "errors:auth.unauthorized" },
        StatusCodes.UNAUTHORIZED,
      )
    }

    return c.json(await mintToken(claims.sub, SESSION_ROLES.PLAYER))
  })

export const auth = routes
