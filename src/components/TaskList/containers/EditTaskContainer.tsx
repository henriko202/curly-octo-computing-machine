"use client"

import { useTranslation } from "react-i18next"
import { Alert } from "@/components/Shared/Alert"
import { Button } from "@/components/Shared/Button"
import { ErrorPage } from "@/components/Shared/ErrorPage"
import { Spinner } from "@/components/Shared/Spinner"
import { TaskForm } from "@/components/TaskList/containers/TaskForm"
import { TaskListQueries } from "@/components/TaskList/queries"
import { APP_ROUTES } from "@/utils/routes"

interface EditTaskContainerProps {
  taskId: string
}

export function EditTaskContainer({ taskId }: EditTaskContainerProps) {
  const { t } = useTranslation(["common", "tasks"])
  const { data: task, status, error, isRefetchError, refetch } = TaskListQueries.useLoadTask(taskId)

  // Keep the edit form mounted whenever cached task data exists so a transient
  // background refetch failure never wipes the user's unsaved draft.
  if (task) {
    const deletedElsewhere = isRefetchError && error?.data?.code === "NOT_FOUND"

    return (
      <div className="space-y-4">
        {isRefetchError && (
          <Alert
            variant="error"
            title={
              deletedElsewhere ? t("tasks:errors.deletedElsewhereTitle") : t("tasks:errors.backgroundRefreshTitle")
            }
            action={
              !deletedElsewhere ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void refetch()}>
                  {t("common:actions.retry")}
                </Button>
              ) : undefined
            }>
            {deletedElsewhere ? t("tasks:errors.deletedElsewhereMessage") : t("tasks:errors.backgroundRefreshMessage")}
          </Alert>
        )}

        <TaskForm
          key={task.id}
          mode="edit"
          initialTask={task}
        />
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
        <Spinner size="md" />
        <span>{t("tasks:errors.loadingTask")}</span>
      </div>
    )
  }

  const code = error.data?.code
  const isNotFound = code === "NOT_FOUND"
  const isBadRequest = code === "BAD_REQUEST"

  return (
    <ErrorPage
      title={isNotFound ? t("tasks:errors.notFoundTitle") : t("tasks:errors.loadTaskTitle")}
      message={
        isNotFound
          ? t("tasks:errors.notFoundMessage")
          : isBadRequest
            ? t("tasks:errors.invalidId")
            : error.message || t("tasks:errors.loadTaskFallback")
      }
      backHref={APP_ROUTES.tasks.list}
      backLabel={t("common:actions.backToTasks")}
      onRetry={!isNotFound && !isBadRequest ? () => void refetch() : undefined}
    />
  )
}
