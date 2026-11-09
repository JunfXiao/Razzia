import i18n, { type Resource, type ResourceKey } from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

const modules = import.meta.glob("./locales/*/*.json", { eager: true })

const resources = Object.entries(modules).reduce<Resource>(
  (acc, [path, mod]) => {
    const match = /\.\/locales\/(\w+)\/(\w+)\.json$/u.exec(path)

    if (!match) {
      return acc
    }

    const [, lang, ns] = match
    acc[lang] ??= {}
    acc[lang][ns] = (mod as { default: ResourceKey }).default

    return acc
  },
  {},
)

const LANGUAGE_STORAGE_KEY = "i18nextLng"

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: Object.keys(resources),
    load: "languageOnly",
    defaultNS: "common",
    resources,
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: LANGUAGE_STORAGE_KEY,
      // Only an explicit choice is stored, so an inferred language keeps
      // following the browser.
      caches: [],
    },
    interpolation: { escapeValue: false },
  })

export const selectLanguage = async (language: string) => {
  await i18n.changeLanguage(language)

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    /* Empty */
  }
}

export default i18n
