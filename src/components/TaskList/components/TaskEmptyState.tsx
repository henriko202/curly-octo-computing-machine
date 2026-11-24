"use client"

import { ClipboardList } from "lucide-react"
import { useTranslation } from "react-i18next"
import { TaskAddButton } from "@/components/TaskList/components/TaskAddButton"

export function TaskEmptyState() {
  const { t } = useTranslation("tasks")

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <ClipboardList
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>
      <h2 className="mt-4 text-base font-semibold text-slate-900">{t("empty.title")}</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{t("empty.description")}</p>
      <TaskAddButton className="mt-5" />
    </div>
  )
}
