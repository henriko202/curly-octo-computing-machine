import "server-only"
import { readFile } from "node:fs/promises"
import path from "node:path"
import { createInstance, type Resource } from "i18next"
import { cookies, headers } from "next/headers"
import { cache } from "react"
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

const localeCache = new Map<string, NamespaceDictionary>()

async function loadNamespaceFromPublic(
  locale: SupportedLocale,
  namespace: I18nNamespace
): Promise<NamespaceDictionary> {
  const cacheKey = `${locale}:${namespace}`
  if (process.env.NODE_ENV === "production") {
    const cached = localeCache.get(cacheKey)
    if (cached) return cached
  }

  const filePath = path.join(process.cwd(), "public", "locales", locale, `${namespace}.json`)
  const raw = await readFile(filePath, "utf8")
  const parsed = JSON.parse(raw) as NamespaceDictionary

  if (process.env.NODE_ENV === "production") {
    localeCache.set(cacheKey, parsed)
  }

  return parsed
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
 * Loads the locale JSON files from `public/locales/<locale>/<ns>.json` on the server
 * so the initial SSR HTML and browser hydration match with zero loading flash.
 */
export const getServerResources = cache(async (locale: SupportedLocale): Promise<Resource> => {
  const localesToLoad: SupportedLocale[] = locale === DEFAULT_LOCALE ? [DEFAULT_LOCALE] : [locale, DEFAULT_LOCALE]

  const resources: Resource = {}

  await Promise.all(
    localesToLoad.map(async lng => {
      const entries = await Promise.all(I18N_NAMESPACES.map(async ns => [ns, await loadNamespaceFromPublic(lng, ns)]))
      resources[lng] = Object.fromEntries(entries)
    })
  )

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
