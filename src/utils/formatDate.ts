import { LOCALE_INTL_MAP, resolveLocale } from "@/i18n/config"
import { TASK_DATE_FORMAT_OPTIONS } from "@/utils/constants/date"

/**
 * Formats a Date instance into a compact, deterministic UTC timestamp localized
 * to the active UI language so SSR and client hydration always match.
 */
export function formatTaskDate(date: Date, language?: string): string {
  const locale = LOCALE_INTL_MAP[resolveLocale(language)]
  return new Intl.DateTimeFormat(locale, TASK_DATE_FORMAT_OPTIONS).format(date)
}
