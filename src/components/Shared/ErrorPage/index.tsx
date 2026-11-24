"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useTranslation } from "react-i18next"
import { Alert } from "@/components/Shared/Alert"
import { Button } from "@/components/Shared/Button"
import { APP_ROUTES } from "@/utils/routes"

interface ErrorPageProps {
  title: string
  message: string
  backHref?: string
  backLabel?: string
  onRetry?: () => void
}

export function ErrorPage({ title, message, backHref = APP_ROUTES.home, backLabel, onRetry }: ErrorPageProps) {
  const { t } = useTranslation("common")

  return (
    <section className="space-y-4">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
        <ArrowLeft
          className="h-4 w-4"
          aria-hidden="true"
        />
        <span>{backLabel ?? t("actions.backToHome")}</span>
      </Link>

      <Alert
        variant="error"
        title={title}
        action={
          onRetry ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRetry}>
              {t("actions.retry")}
            </Button>
          ) : undefined
        }>
        {message}
      </Alert>
    </section>
  )
}
