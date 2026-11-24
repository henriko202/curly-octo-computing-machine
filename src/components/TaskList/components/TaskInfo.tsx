"use client"

import { Calendar } from "lucide-react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import type { Task } from "@/components/TaskList/domain/models/Task"
import { formatTaskDate } from "@/utils"

interface TaskInfoProps {
  task: Task
  actions?: ReactNode
}

export function TaskInfo({ task, actions }: TaskInfoProps) {
  const { t, i18n } = useTranslation("tasks")
  const formattedDate = formatTaskDate(task.createdAt, i18n.resolvedLanguage ?? i18n.language)

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <h2 className="min-w-0 flex-1 pt-1 text-base font-semibold [overflow-wrap:anywhere] text-slate-900">
          {task.title}
        </h2>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:min-w-[220px] sm:flex-nowrap">
            {actions}
          </div>
        )}
      </div>

      {task.description && (
        <p className="text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap text-slate-600">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
        <Calendar
          className="h-3.5 w-3.5 shrink-0"
          aria-hidden="true"
        />
        <time dateTime={task.createdAt.toISOString()}>{t("list.createdAt", { date: formattedDate })}</time>
      </div>
    </div>
  )
}
