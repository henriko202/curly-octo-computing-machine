import "server-only"
import { createInstance, type Resource } from "i18next"
import { cookies, headers } from "next/headers"
import { cache } from "react"
import enCommon from "../../public/locales/en/common.json"
import enTasks from "../../public/locales/en/tasks.json"
import esCommon from "../../public/locales/es/common.json"
import esTasks from "../../public/locales/es/tasks.json"
import ptCommon from "../../public/locales/pt/common.json"
import ptTasks from "../../public/locales/pt/tasks.json"
import {
  DEFAULT_LOCALE,
  I18N_NAMESPACES,
  isSupportedLocale,
  LOCALE_COOKIE_NAME,
  parseAcceptLanguage,
  type I18nNamespace,
  type SupportedLocale
} from "@/i18n/config"

type NamespaceDictionary = Record<string, unknown>

/**
 * Static imports keep SSR locale loading compatible with both Node.js and
 * edge runtimes like Cloudflare Workers (where `public/` is served as static
 * assets rather than a local filesystem).
 */
const STATIC_LOCALE_BUNDLES: Record<SupportedLocale, Record<I18nNamespace, NamespaceDictionary>> = {
  en: {
    common: enCommon,
    tasks: enTasks
  },
  pt: {
    common: ptCommon,
    tasks: ptTasks
  },
  es: {
    common: esCommon,
    tasks: esTasks
  }
}

/**
 * Resolves the active request locale from the `NEXT_LOCALE` cookie first,
 * then falls back to the browser's `Accept-Language` header, then `"en"`.
 */
export const getServerLocale = cache(async (): Promise<SupportedLocale> => {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  if (isSupportedLocale(cookieLocale)) {
    return cookieLocale
  }

  const headerStore = await headers()
  return parseAcceptLanguage(headerStore.get("accept-language"))
})

/**
 * Returns the locale dictionaries for the active locale (plus English fallback)
 * so initial SSR HTML and browser hydration match with zero loading flash.
 */
export const getServerResources = cache(async (locale: SupportedLocale): Promise<Resource> => {
  const localesToLoad: SupportedLocale[] = locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE]

  const resources: Resource = {}
  for (const lng of localesToLoad) {
    resources[lng] = STATIC_LOCALE_BUNDLES[lng]
  }

  return resources
})

/**
 * Creates a request-scoped i18next instance for Server Components and `generateMetadata`.
 */
export const getServerTranslation = cache(async (requestedLocale?: SupportedLocale) => {
  const locale = requestedLocale ?? (await getServerLocale())
  const resources = await getServerResources(locale)

  const instance = createInstance()
  await instance.init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [locale, DEFAULT_LOCALE],
    ns: [...I18N_NAMESPACES],
    defaultNS: "common",
    resources,
    interpolation: { escapeValue: false }
  })

  return {
    i18n: instance,
    t: instance.t.bind(instance),
    locale,
    resources
  }
})
