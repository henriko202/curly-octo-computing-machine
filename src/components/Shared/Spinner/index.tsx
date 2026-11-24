"use client"

import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { cn } from "@/utils"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
  label?: string
}

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6"
}

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  const { t } = useTranslation("common")

  return (
    <span
      role="status"
      className="inline-flex items-center">
      <Loader2
        aria-hidden="true"
        className={cn("animate-spin", sizeClasses[size], className)}
      />
      <span className="sr-only">{label ?? t("states.loading")}</span>
    </span>
  )
}
