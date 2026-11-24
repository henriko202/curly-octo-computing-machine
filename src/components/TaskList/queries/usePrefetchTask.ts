"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTRPC } from "@/utils/trpc/client"

/**
 * Warms the TanStack Query `task.getById` cache on hover/focus before navigating
 * to the edit page. Respects the QueryClient `staleTime`, avoiding duplicate fetches.
 */
export function usePrefetchTask() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useCallback(
    (id: string) => {
      void queryClient.query(trpc.task.getById.queryOptions({ id })).catch(() => undefined)
    },
    [queryClient, trpc]
  )
}
