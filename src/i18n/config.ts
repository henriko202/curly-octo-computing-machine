export const SUPPORTED_LOCALES = ["en", "pt", "es"] as const

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: SupportedLocale = "en"

export const LOCALE_COOKIE_NAME = "NEXT_LOCALE"

export const I18N_NAMESPACES = ["common", "tasks"] as const

export type I18nNamespace = (typeof I18N_NAMESPACES)[number]

export const LOCALE_INTL_MAP: Record<SupportedLocale, string> = {
  en: "en-US",
  pt: "pt-BR",
  es: "es-ES"
}

export function isSupportedLocale(value?: string | null): value is SupportedLocale {
  return Boolean(value && (SUPPORTED_LOCALES as readonly string[]).includes(value))
}

/**
 * Normalizes a BCP-47 tag (e.g. "pt-BR", "es-MX") to a supported locale.
 */
export function resolveLocale(candidate?: string | null): SupportedLocale {
  if (!candidate) return DEFAULT_LOCALE
  const normalized = candidate.trim().toLowerCase()

  if (isSupportedLocale(normalized)) {
    return normalized
  }

  const baseLanguage = normalized.split(/[-_]/)[0]
  if (isSupportedLocale(baseLanguage)) {
    return baseLanguage
  }

  return DEFAULT_LOCALE
}

/**
 * Parses an HTTP Accept-Language header and picks the highest-priority supported locale.
 */
export function parseAcceptLanguage(header?: string | null): SupportedLocale {
  if (!header) return DEFAULT_LOCALE

  const preferences = header
    .split(",")
    .map(part => {
      const [tag, ...params] = part.trim().split(";")
      const qParam = params.find(p => p.trim().startsWith("q="))
      const weight = qParam ? Number(qParam.trim().slice(2)) : 1
      return {
        tag: tag.trim(),
        weight: Number.isFinite(weight) ? weight : 0
      }
    })
    .filter(entry => entry.tag.length > 0 && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight)

  for (const { tag } of preferences) {
    const base = tag.toLowerCase().split(/[-_]/)[0]
    if (isSupportedLocale(base)) {
      return base
    }
  }

  return DEFAULT_LOCALE
}
