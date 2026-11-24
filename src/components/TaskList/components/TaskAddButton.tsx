"use client"

import { Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/shared/button"
import { APP_ROUTES } from "@/utils/routes"

interface TaskAddButtonProps {
  label?: string
  className?: string
}

export function TaskAddButton({ label, className }: TaskAddButtonProps) {
  const router = useRouter()
  const { t } = useTranslation("tasks")

  const handlePrefetchCreate = useCallback(() => {
    router.prefetch(APP_ROUTES.tasks.new)
  }, [router])

  return (
    <Button
      asChild
      className={className}>
      <Link
        href={APP_ROUTES.tasks.new}
        prefetch={false}
        onMouseEnter={handlePrefetchCreate}
        onFocus={handlePrefetchCreate}>
        <Plus
          className="size-4"
          aria-hidden="true"
        />
        <span>{label ?? t("createTask")}</span>
      </Link>
    </Button>
  )
}
