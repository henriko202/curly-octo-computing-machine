"use client"

import { useTranslation } from "react-i18next"
import { Alert } from "@/components/Shared/Alert"
import { Button } from "@/components/Shared/Button"
import { Spinner } from "@/components/Shared/Spinner"
import { TaskEmptyState } from "@/components/TaskList/components/TaskEmptyState"
import { TaskItem } from "@/components/TaskList/components/TaskItem"
import { TaskListFooter } from "@/components/TaskList/components/TaskListFooter"
import { TaskListProvider, useTaskListContext } from "@/components/TaskList/hooks/context"

function TaskListBody() {
  const { t } = useTranslation(["common", "tasks"])
  const {
    tasks,
    totalCount,
    hasLoadedData,
    isInitialLoading,
    isInitialError,
    initialErrorMessage,
    backgroundErrorMessage,
    deleteError,
    refetch,
    clearDeleteError
  } = useTaskListContext()

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("tasks:title")}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {hasLoadedData
              ? totalCount === 0
                ? t("tasks:subtitle.empty")
                : t("tasks:subtitle.showing", {
                    shown: tasks.length,
                    total: totalCount,
                    count: totalCount
                  })
              : t("tasks:subtitle.default")}
          </p>
        </div>
      </div>

      {deleteError && (
        <Alert
          variant="error"
          title={t("tasks:errors.deleteTitle")}
          action={
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDeleteError}>
              {t("common:actions.dismiss")}
            </Button>
          }>
          {deleteError}
        </Alert>
      )}

      {backgroundErrorMessage && (
        <Alert
          variant="error"
          title={t("tasks:errors.refreshListTitle")}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={refetch}>
              {t("common:actions.retry")}
            </Button>
          }>
          {backgroundErrorMessage}
        </Alert>
      )}

      {isInitialLoading && (
        <div className="flex items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-16 text-sm text-slate-500">
          <Spinner size="md" />
          <span>{t("tasks:list.loading")}</span>
        </div>
      )}

      {isInitialError && (
        <Alert
          variant="error"
          title={t("tasks:errors.loadListTitle")}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={refetch}>
              {t("common:actions.retry")}
            </Button>
          }>
          {initialErrorMessage || t("tasks:errors.loadListMessage")}
        </Alert>
      )}

      {hasLoadedData && tasks.length === 0 && <TaskEmptyState />}

      {hasLoadedData && tasks.length > 0 && (
        <>
          <div className="space-y-3">
            {tasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
              />
            ))}
          </div>

          <TaskListFooter />
        </>
      )}
    </section>
  )
}

export function TaskContainer() {
  return (
    <TaskListProvider>
      <TaskListBody />
    </TaskListProvider>
  )
}
