import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { I18N_NAMESPACES, parseAcceptLanguage, resolveLocale, SUPPORTED_LOCALES } from "@/i18n/config"

function collectLeafKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = []
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...collectLeafKeys(value as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys.sort()
}

describe("i18n config & locale dictionaries", () => {
  it("resolves exact and regional locale tags with fallback to en", () => {
    expect(resolveLocale("pt")).toBe("pt")
    expect(resolveLocale("pt-BR")).toBe("pt")
    expect(resolveLocale("es-MX")).toBe("es")
    expect(resolveLocale("en-US")).toBe("en")
    expect(resolveLocale("fr-FR")).toBe("en")
    expect(resolveLocale(undefined)).toBe("en")
  })

  it("parses Accept-Language headers by quality weight", () => {
    expect(parseAcceptLanguage("fr-FR,fr;q=0.9,es-AR;q=0.8,en;q=0.7")).toBe("es")
    expect(parseAcceptLanguage("pt-BR,pt;q=0.9,en-US;q=0.8")).toBe("pt")
    expect(parseAcceptLanguage("de-DE,ja;q=0.5")).toBe("en")
  })

  it("keeps identical translation keys across en, pt, and es under public/locales", () => {
    for (const ns of I18N_NAMESPACES) {
      const enPath = path.join(process.cwd(), "public", "locales", "en", `${ns}.json`)
      const enKeys = collectLeafKeys(JSON.parse(readFileSync(enPath, "utf8")) as Record<string, unknown>)

      for (const locale of SUPPORTED_LOCALES) {
        const filePath = path.join(process.cwd(), "public", "locales", locale, `${ns}.json`)
        const localeKeys = collectLeafKeys(JSON.parse(readFileSync(filePath, "utf8")) as Record<string, unknown>)
        expect(localeKeys, `Mismatch in ${locale}/${ns}.json`).toEqual(enKeys)
      }
    }
  })
})
