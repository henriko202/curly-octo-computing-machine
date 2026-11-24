"use client"

import { useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/utils/trpc/client"

/**
 * Loads a single task by ID (hydrated from SSR on the edit route).
 * Uses the shared QueryClient retry policy (skips 4xx errors, retries transient 5xx/network failures once).
 */
export function useLoadTask(id: string) {
  const trpc = useTRPC()

  return useQuery(trpc.task.getById.queryOptions({ id }))
}
