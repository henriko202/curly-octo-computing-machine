"use client"

import { createInstance, type i18n as I18nInstance, type Resource } from "i18next"
import HttpBackend from "i18next-http-backend"
import { useEffect, useState, type ReactNode } from "react"
import { I18nextProvider, initReactI18next } from "react-i18next"
import {
  DEFAULT_LOCALE,
  I18N_NAMESPACES,
  LOCALE_COOKIE_NAME,
  SUPPORTED_LOCALES,
  type SupportedLocale
} from "@/i18n/config"

interface I18nProviderProps {
  initialLocale: SupportedLocale
  initialResources: Resource
  children: ReactNode
}

function createClientI18n(initialLocale: SupportedLocale, initialResources: Resource): I18nInstance {
  const instance = createInstance()

  // `partialBundledLanguages: true` lets the initial SSR locale render synchronously
  // without a flash while `i18next-http-backend` dynamically fetches other locales
  // from `/locales/{{lng}}/{{ns}}.json` when the user switches languages.
  void instance
    .use(HttpBackend)
    .use(initReactI18next)
    .init({
      lng: initialLocale,
      fallbackLng: DEFAULT_LOCALE,
      supportedLngs: [...SUPPORTED_LOCALES],
      ns: [...I18N_NAMESPACES],
      defaultNS: "common",
      resources: initialResources,
      partialBundledLanguages: true,
      initAsync: false,
      interpolation: {
        escapeValue: false
      },
      backend: {
        loadPath: "/locales/{{lng}}/{{ns}}.json"
      },
      react: {
        useSuspense: false
      }
    })

  return instance
}

export async function changeAppLanguage(i18n: I18nInstance, locale: SupportedLocale): Promise<void> {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; SameSite=Lax`
  await i18n.changeLanguage(locale)
  document.documentElement.lang = locale
}

export function I18nProvider({ initialLocale, initialResources, children }: I18nProviderProps) {
  const [i18nInstance] = useState(() => createClientI18n(initialLocale, initialResources))

  useEffect(() => {
    const syncHtmlLang = (lng: string) => {
      document.documentElement.lang = lng
    }

    syncHtmlLang(i18nInstance.resolvedLanguage ?? initialLocale)
    i18nInstance.on("languageChanged", syncHtmlLang)
    return () => {
      i18nInstance.off("languageChanged", syncHtmlLang)
    }
  }, [i18nInstance, initialLocale])

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>
}
