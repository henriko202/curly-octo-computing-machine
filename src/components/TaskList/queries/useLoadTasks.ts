"use client"

import { useInfiniteQuery } from "@tanstack/react-query"
import { DEFAULT_TASK_LIST_INPUT, getNextTaskPageParam } from "@/components/TaskList/domain/constants"
import type { GetTasksParams } from "@/components/TaskList/domain/types/GetTasksParams"
import { useTRPC } from "@/utils/trpc/client"

/**
 * Loads tasks incrementally via cursor-based pagination backed by tRPC + React Query.
 */
export function useLoadTasks(params?: Pick<GetTasksParams, "limit">) {
  const trpc = useTRPC()
  const input = params?.limit !== undefined ? { limit: params.limit } : DEFAULT_TASK_LIST_INPUT

  return useInfiniteQuery(
    trpc.task.list.infiniteQueryOptions(input, {
      getNextPageParam: getNextTaskPageParam
    })
  )
}
