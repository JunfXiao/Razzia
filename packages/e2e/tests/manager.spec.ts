import { expect, test } from "@razzia/e2e/utils/fixtures"
import { t } from "@razzia/e2e/utils/i18n"
import { loginManager } from "@razzia/e2e/utils/manager"

test("refuses a wrong manager password", async ({ page }) => {
  await page.goto("/manager")
  await page.getByPlaceholder(t("manager:passwordPlaceholder")).fill("wrong")
  await page.getByRole("button", { name: t("common:submit") }).click()

  await expect(
    page.getByText(t("errors:manager.invalidPassword")),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/manager$/u)
})

test("draws the manager password with the mask font", async ({ page }) => {
  await page.goto("/manager")

  const password = page.getByPlaceholder(t("manager:passwordPlaceholder"))

  await password.fill("secret")

  expect(
    await password.evaluate((input) => getComputedStyle(input).fontFamily),
  ).toContain("text-security-disc")
  expect(
    await page.evaluate(
      async () =>
        (await document.fonts.load('1em "text-security-disc"')).length,
    ),
  ).toBe(1)
})

test("keeps the manager logged in after a reload", async ({ page }) => {
  await loginManager(page)
  await page.reload()

  await expect(page.getByText(t("manager:configurationsTitle"))).toBeVisible()
})

test("logs the manager out", async ({ page }) => {
  await loginManager(page)
  await page.getByRole("button", { name: t("manager:logout") }).click()

  await expect(page).toHaveURL(/\/manager$/u)
  await expect(
    page.getByPlaceholder(t("manager:passwordPlaceholder")),
  ).toBeVisible()

  await page.goto("/manager/config")

  await expect(page).toHaveURL(/\/manager$/u)
})

test("switches the language and keeps it after a reload", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("combobox", { name: t("common:changeLanguage") }).click()
  await page.getByRole("option", { name: t("common:language.fr") }).click()

  await expect(page.getByText(t("game:pinLabel", { lng: "fr" }))).toBeVisible()
  await expect(
    page.getByRole("button", { name: t("common:submit", { lng: "fr" }) }),
  ).toBeVisible()

  await page.reload()

  await expect(page.getByText(t("game:pinLabel", { lng: "fr" }))).toBeVisible()
})
