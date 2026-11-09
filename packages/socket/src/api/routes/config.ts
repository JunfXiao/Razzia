import type { AppConfig } from "@razzia/common/types/config"
import { appName, footerText } from "@razzia/socket/env"
import { Hono } from "hono"

const routes = new Hono().get("/", (c) =>
  c.json({
    appName: appName ?? null,
    footerText: footerText ?? null,
  } satisfies AppConfig),
)

export const config = routes
