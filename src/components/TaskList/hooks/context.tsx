"use client"

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import type { Task } from "@/components/TaskList/domain/models/Task"
import { TaskListMutations } from "@/components/TaskList/mutations"
import { TaskListQueries } from "@/components/TaskList/queries"
import { useInfiniteScroll } from "@/utils"

interface TaskListContextValue {
  tasks: Task[]
  totalCount: number
  hasLoadedData: boolean
  isInitialLoading: boolean
  isInitialError: boolean
  initialErrorMessage: string | null
  backgroundErrorMessage: string | null
  isFetching: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  isFetchNextPageError: boolean
  deletingIds: Set<string>
  deleteError: string | null
  sentinelRef: (node: HTMLDivElement | null) => void
  refetch: () => void
  loadMore: () => void
  deleteTask: (id: string) => void
  clearDeleteError: () => void
}

const TaskListContext = createContext<TaskListContextValue | null>(null)

/**
 * Feature-scoped context sharing paginated task state, infinite scroll controls,
 * and delete mutation handlers across TaskList child components without prop drilling.
 */
export function TaskListProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation("tasks")
  const [deletingIds, setDeletingIds] = useState<Set<string>>(() => new Set())
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set())
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const {
    data,
    status,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError
  } = TaskListQueries.useLoadTasks()

  const { mutateAsync: deleteTaskAsync } = TaskListMutations.useDeleteTask()

  const tasks = useMemo<Task[]>(() => {
    if (!data?.pages) return []
    const seen = new Set<string>()
    const result: Task[] = []

    for (const page of data.pages) {
      for (const task of page.items) {
        if (!deletedIds.has(task.id) && !seen.has(task.id)) {
          seen.add(task.id)
          result.push(task)
        }
      }
    }

    return result
  }, [data, deletedIds])

  const hasLoadedData = Boolean(data)
  const reportedTotal = data?.pages.at(-1)?.totalCount ?? tasks.length
  // Keep displayed counts consistent with loaded rows even under concurrent multi-tab edits.
  const totalCount = !hasNextPage ? tasks.length : Math.max(tasks.length, reportedTotal)

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetching) {
      void fetchNextPage({ cancelRefetch: false })
    }
  }, [fetchNextPage, hasNextPage, isFetching])

  const sentinelRef = useInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isFetching && !isFetchNextPageError,
    onLoadMore: loadMore
  })

  /**
   * Uses `mutateAsync` with `try/catch/finally` instead of per-call `mutate`
   * callbacks so overlapping deletes across rows never drop error handling or
   * leave an ID stranded in `deletingIds`. Also records confirmed deletions in
   * `deletedIds` so a superseded refetch never flashes a deleted row back as clickable.
   */
  const deleteTask = useCallback(
    (id: string) => {
      setDeleteError(null)
      setDeletingIds(prev => new Set(prev).add(id))

      void (async () => {
        try {
          await deleteTaskAsync({ id })
          setDeletedIds(prev => new Set(prev).add(id))
          toast.success(t("toasts.deleted"))
        } catch (mutationError) {
          const errorCode =
            typeof mutationError === "object" && mutationError !== null
              ? (mutationError as { data?: { code?: string } }).data?.code
              : undefined

          // If the server confirms the task is already gone, hide the stale row immediately.
          if (errorCode === "NOT_FOUND") {
            setDeletedIds(prev => new Set(prev).add(id))
          }

          const message =
            errorCode === "NOT_FOUND"
              ? t("errors.notFoundMessage")
              : mutationError instanceof Error && mutationError.message
                ? mutationError.message
                : t("errors.deleteFallback")
          setDeleteError(message)
          toast.error(message)
        } finally {
          setDeletingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
        }
      })()
    },
    [deleteTaskAsync, t]
  )

  const clearDeleteError = useCallback(() => setDeleteError(null), [])
  const handleRefetch = useCallback(() => {
    void refetch()
  }, [refetch])

  const isBackgroundError = status === "error" && hasLoadedData && !isFetchNextPageError

  const value = useMemo<TaskListContextValue>(
    () => ({
      tasks,
      totalCount,
      hasLoadedData,
      isInitialLoading: status === "pending",
      isInitialError: status === "error" && !hasLoadedData,
      initialErrorMessage: error?.message ?? null,
      backgroundErrorMessage: isBackgroundError ? error?.message || t("errors.refreshListMessage") : null,
      isFetching,
      hasNextPage: Boolean(hasNextPage),
      isFetchingNextPage,
      isFetchNextPageError,
      deletingIds,
      deleteError,
      sentinelRef,
      refetch: handleRefetch,
      loadMore,
      deleteTask,
      clearDeleteError
    }),
    [
      tasks,
      totalCount,
      hasLoadedData,
      status,
      error,
      isBackgroundError,
      isFetching,
      hasNextPage,
      isFetchingNextPage,
      isFetchNextPageError,
      deletingIds,
      deleteError,
      sentinelRef,
      handleRefetch,
      loadMore,
      deleteTask,
      clearDeleteError,
      t
    ]
  )

  return <TaskListContext.Provider value={value}>{children}</TaskListContext.Provider>
}

export function useTaskListContext() {
  const context = useContext(TaskListContext)
  if (!context) {
    throw new Error("useTaskListContext must be used within a TaskListProvider.")
  }
  return context
}
