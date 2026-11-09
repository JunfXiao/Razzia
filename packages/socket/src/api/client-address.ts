import { getConnInfo } from "@hono/node-server/conninfo"
import { trustedIpHeader } from "@razzia/socket/env"
import type { Context } from "hono"

/**
 * Identifies the caller for throttling. Without a trusted header every client
 * behind a reverse proxy shares that proxy's address, and so one allowance.
 */
export const clientAddress = (c: Context): string => {
  const forwarded = trustedIpHeader ? c.req.header(trustedIpHeader) : undefined

  if (forwarded) {
    return forwarded
  }

  try {
    return getConnInfo(c).remote.address ?? "unknown"
  } catch {
    return "unknown"
  }
}
