"use client"

import { Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { resolveLocale, SUPPORTED_LOCALES, type SupportedLocale } from "@/i18n/config"
import { changeAppLanguage } from "@/i18n/I18nProvider"
import { cn } from "@/utils"

export function LanguageSelector() {
  const router = useRouter()
  const { t, i18n } = useTranslation("common")
  const [isSwitching, setIsSwitching] = useState(false)

  const activeLocale = resolveLocale(i18n.resolvedLanguage ?? i18n.language)

  async function handleSelectLocale(locale: SupportedLocale) {
    if (locale === activeLocale || isSwitching) return

    setIsSwitching(true)
    try {
      await changeAppLanguage(i18n, locale)
      // Refresh server-rendered metadata and Server Component boundaries with the new cookie.
      router.refresh()
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div
      role="group"
      aria-label={t("language.label")}
      className="inline-flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-1 sm:gap-1">
      <Globe
        className="mr-0.5 ml-1 hidden h-3.5 w-3.5 text-slate-400 sm:block"
        aria-hidden="true"
      />
      {SUPPORTED_LOCALES.map(locale => {
        const isActive = locale === activeLocale
        return (
          <button
            key={locale}
            type="button"
            disabled={isSwitching}
            aria-pressed={isActive}
            title={t(`language.names.${locale}`)}
            onClick={() => void handleSelectLocale(locale)}
            className={cn(
              "cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:outline-none disabled:cursor-not-allowed",
              isActive ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
            )}>
            {t(`language.${locale}`)}
          </button>
        )
      })}
    </div>
  )
}
