# Configuration

Razzia is configured in two places:

- **Environment variables** for the manager password and the session secret.
- The **`config` folder** for content: quizzes, results and branding. It is mounted as a Docker volume, or resolved as `../../config` relative to the packages when running without Docker.

## Environment variables

Copy [`.env.example`](../.env.example) to `.env` at the root of the project:

```bash
MANAGER_PASSWORD=your-password
JWT_SECRET=
```

| Variable               | Required | What it does                                                                                                              |
| ---------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- |
| `MANAGER_PASSWORD`     | Yes      | Unlocks the manager interface. Until it is set, manager access is refused with `errors:manager.passwordNotConfigured`.    |
| `JWT_SECRET`           | No       | Signs session tokens. Must be at least 32 characters; a shorter value is ignored.                                         |
| `WEB_PORT`             | No       | Without Docker only: port the app is served on. Defaults to `3000`.                                                       |
| `SOCKET_PORT`          | No       | Without Docker only: port of the socket server, proxied behind the web port. Defaults to `3001`.                          |
| `TURNSTILE_SITE_KEY`   | No       | Cloudflare Turnstile site key. Set it together with `TURNSTILE_SECRET_KEY` to protect the manager login.                  |
| `TURNSTILE_SECRET_KEY` | No       | Cloudflare Turnstile secret key.                                                                                          |
| `TRUSTED_IP_HEADER`    | No       | Header holding the real client IP behind a proxy, such as `CF-Connecting-IP`, so that login limits apply per client.      |
| `LOGIN_MAX_FAILURES`   | No       | Wrong passwords allowed per client within 15 minutes before a lockout. Defaults to `5`; `0` turns the lockout off.        |
| `APP_NAME`             | No       | App name shown in the browser tab and as the logo's alternative text. Overrides `appName` of the [branding](branding.md). |
| `FOOTER_TEXT`          | No       | Extra line of plain text shown in the page footer, such as a legal notice or a site registration number.                  |

`APP_NAME` and `FOOTER_TEXT` are read by the server at start and sent to the browser, so they apply to the prebuilt Docker image without a rebuild. Values that are empty or only spaces count as unset.

`pnpm dev` and `pnpm start` load `.env` automatically. With Docker, `compose.yml` reads the same file through `env_file`, or you can set the variables inline with `environment:`. With a bare `docker run`, pass them with `-e MANAGER_PASSWORD=...`.

### Protecting the manager login

By default, five wrong passwords from one client lock that client out of the manager login for up to 15 minutes. `LOGIN_MAX_FAILURES` changes that number, and `0` turns the lockout off. Behind a reverse proxy, set `TRUSTED_IP_HEADER`; otherwise every visitor shares the proxy's address and one allowance. Only name a header that your proxy always overwrites, and make sure the app cannot be reached without passing through that proxy, because a client could otherwise forge the header.

### About `JWT_SECRET`

Leave it empty and the server generates a new secret at every start. The consequence is that a restart logs every manager out and hands every player a fresh identity.

That is usually fine: game state lives in memory, so a restart already ends every running game — the sessions it invalidates point at games that no longer exist. Set the variable only if you want sessions to survive a restart, and keep it secret: anyone holding it can forge a manager session.

Generate one with either of these:

```bash
openssl rand -hex 32

# No openssl? Node is already a prerequisite:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Both print 64 hexadecimal characters, the same shape the server generates for itself.

## The `config` folder

Created automatically on first run, with an example quiz:

```
config/
  quizz/      your quizzes
  results/    saved game results
  media/      files uploaded from the quiz editor
  branding/   optional theming
```

See [Quiz Configuration](quiz.md) and [Custom Branding](branding.md).
