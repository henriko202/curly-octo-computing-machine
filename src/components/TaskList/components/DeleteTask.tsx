"use client"

import { Trash2 } from "lucide-react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/Shared/Button"
import { useTaskListContext } from "@/components/TaskList/hooks/context"

interface DeleteTaskProps {
  taskId: string
  taskTitle: string
  isConfirming: boolean
  onConfirmingChange: (confirming: boolean) => void
}

export function DeleteTask({ taskId, taskTitle, isConfirming, onConfirmingChange }: DeleteTaskProps) {
  const { t } = useTranslation(["common", "tasks"])
  const { deletingIds, deleteTask } = useTaskListContext()
  const isDeleting = deletingIds.has(taskId)

  if (isConfirming) {
    return (
      <>
        <Button
          variant="danger"
          size="sm"
          isLoading={isDeleting}
          loadingText={t("common:states.deleting")}
          onClick={() => deleteTask(taskId)}
          className="whitespace-nowrap">
          {t("common:actions.confirm")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={isDeleting}
          onClick={() => onConfirmingChange(false)}
          className="whitespace-nowrap">
          {t("common:actions.cancel")}
        </Button>
      </>
    )
  }

  return (
    <Button
      variant="danger-ghost"
      size="sm"
      disabled={isDeleting}
      onClick={() => onConfirmingChange(true)}
      aria-label={t("tasks:list.deleteAriaLabel", { title: taskTitle })}
      className="whitespace-nowrap">
      <Trash2
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />
      <span>{t("common:actions.delete")}</span>
    </Button>
  )
}
