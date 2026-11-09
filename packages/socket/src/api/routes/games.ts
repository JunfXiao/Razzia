import { zValidator } from "@hono/zod-validator"
import {
  checkGameValidator,
  createGameValidator,
  gameSettingsValidator,
  joinGameValidator,
} from "@razzia/common/validators/game"
import { apiFactory } from "@razzia/socket/api/factory"
import { requireManager, requireSession } from "@razzia/socket/api/middleware"
import { i18nHook } from "@razzia/socket/api/validation"
import { mintJoinTicket } from "@razzia/socket/services/auth"
import { getQuizz } from "@razzia/socket/services/config"
import Game from "@razzia/socket/services/game"
import { getIo } from "@razzia/socket/services/io"
import Registry from "@razzia/socket/services/registry"
import { StatusCodes } from "http-status-codes"

const routes = apiFactory
  .createApp()
  .get("/active", requireManager, (c) => {
    const game = Registry.getInstance().getRunningGame(c.get("claims").sub)

    return c.json({
      game: game
        ? {
            gameId: game.gameId,
            inviteCode: game.inviteCode,
            subject: game.subject,
            branding: game.branding,
          }
        : null,
    })
  })
  .post(
    "/",
    requireManager,
    zValidator("json", createGameValidator, i18nHook),
    (c) => {
      const { quizzId } = c.req.valid("json")

      if (Registry.getInstance().getRunningGame(c.get("claims").sub)) {
        return c.json(
          { error: "errors:game.alreadyRunning" },
          StatusCodes.CONFLICT,
        )
      }

      const quizz = getQuizz().find((q) => q.id === quizzId)

      if (!quizz) {
        return c.json({ error: "errors:quizz.notFound" }, StatusCodes.NOT_FOUND)
      }

      const registry = Registry.getInstance()
      const game = new Game(getIo(), c.get("claims").sub, quizz)

      registry.addGame(game)
      registry.markGameAsEmpty(game)

      return c.json(
        {
          gameId: game.gameId,
          inviteCode: game.inviteCode,
          branding: game.branding,
        },
        StatusCodes.CREATED,
      )
    },
  )
  .patch(
    "/:gameId/settings",
    requireManager,
    zValidator("json", gameSettingsValidator, i18nHook),
    (c) => {
      const game = Registry.getInstance().getGameById(c.req.param("gameId"))

      if (!game || game.manager.clientId !== c.get("claims").sub) {
        return c.json({ error: "errors:game.notFound" }, StatusCodes.NOT_FOUND)
      }

      if (!game.updateSettings(c.req.valid("json"))) {
        return c.json(
          { error: "errors:game.alreadyStarted" },
          StatusCodes.CONFLICT,
        )
      }

      return c.json({ settings: game.settings })
    },
  )
  .delete("/:gameId", requireManager, (c) => {
    const registry = Registry.getInstance()
    const game = registry.getManagerGame(
      c.req.param("gameId"),
      c.get("claims").sub,
    )

    if (!game) {
      return c.json({ error: "errors:game.notFound" }, StatusCodes.NOT_FOUND)
    }

    game.end()
    registry.removeGame(game.gameId)

    return c.body(null, StatusCodes.NO_CONTENT)
  })
  .post("/:gameId/leave", requireSession, (c) => {
    const game = Registry.getInstance().getGameById(c.req.param("gameId"))
    const player = game?.players.find((p) => p.clientId === c.get("claims").sub)

    if (player) {
      game?.removePlayer(player.id)
    }

    return c.body(null, StatusCodes.NO_CONTENT)
  })
  .post("/check", zValidator("json", checkGameValidator, i18nHook), (c) => {
    const { inviteCode } = c.req.valid("json")
    const game = Registry.getInstance().getGameByInviteCode(inviteCode)

    if (!game) {
      return c.json({ error: "errors:game.notFound" }, StatusCodes.NOT_FOUND)
    }

    if (game.locked) {
      return c.json({ error: "errors:game.locked" }, StatusCodes.FORBIDDEN)
    }

    return c.json({
      generatedUsernames: game.settings.generatedUsernames,
      branding: game.branding,
    })
  })
  .post(
    "/join",
    requireSession,
    zValidator("json", joinGameValidator, i18nHook),
    async (c) => {
      const { inviteCode, username } = c.req.valid("json")
      const game = Registry.getInstance().getGameByInviteCode(inviteCode)

      if (!game) {
        return c.json({ error: "errors:game.notFound" }, StatusCodes.NOT_FOUND)
      }

      const { sub } = c.get("claims")

      if (game.manager.clientId === sub) {
        return c.json(
          { error: "errors:game.managerCannotJoin" },
          StatusCodes.FORBIDDEN,
        )
      }

      const existing = game.players.find((p) => p.clientId === sub)

      if (existing) {
        return c.json({
          gameId: game.gameId,
          ticket: null,
          username: existing.username,
        })
      }

      if (game.locked) {
        return c.json({ error: "errors:game.locked" }, StatusCodes.FORBIDDEN)
      }

      if (!game.settings.generatedUsernames && !username) {
        return c.json(
          { error: "errors:auth.usernameTooShort" },
          StatusCodes.BAD_REQUEST,
        )
      }

      const name = game.settings.generatedUsernames ? undefined : username

      return c.json({
        gameId: game.gameId,
        ticket: await mintJoinTicket(sub, game.gameId, name),
        username: name ?? null,
      })
    },
  )

export const games = routes
