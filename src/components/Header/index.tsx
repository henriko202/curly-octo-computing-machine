"use client"

import { CheckSquare, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { LanguageSelector } from "@/components/Header/LanguageSelector"
import { Button } from "@/shared/button"
import { APP_ROUTES } from "@/utils/routes"

export function Header() {
  const router = useRouter()
  const { t } = useTranslation(["common", "tasks"])

  const handlePrefetchCreate = useCallback(() => {
    router.prefetch(APP_ROUTES.tasks.new)
  }, [router])

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-3xl flex-col gap-2.5 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-6 sm:py-0">
        <div className="flex min-w-0 items-center justify-between gap-2 sm:flex-1">
          <Link
            href={APP_ROUTES.home}
            className="inline-flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-tight text-slate-900 transition-colors hover:text-slate-700">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              <CheckSquare
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
            <span className="truncate">{t("common:appName")}</span>
          </Link>

          <div className="shrink-0 sm:hidden">
            <LanguageSelector />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          <Button
            asChild
            className="w-full sm:w-auto">
            <Link
              href={APP_ROUTES.tasks.new}
              prefetch={false}
              onMouseEnter={handlePrefetchCreate}
              onFocus={handlePrefetchCreate}>
              <Plus
                className="size-4"
                aria-hidden="true"
              />
              <span>{t("tasks:createTask")}</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
