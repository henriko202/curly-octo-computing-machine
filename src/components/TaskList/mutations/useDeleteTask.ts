"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/utils/trpc/client"

export function useDeleteTask() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.task.delete.mutationOptions({
      onSuccess: async (_result, variables) => {
        queryClient.removeQueries({
          queryKey: trpc.task.getById.queryKey({ id: variables.id })
        })
        await queryClient.invalidateQueries({
          queryKey: trpc.task.list.pathKey()
        })
      },
      onError: async (error, variables) => {
        // Only invalidate when the server confirms the task is gone (NOT_FOUND),
        // avoiding a redundant failing list refetch when offline or on 5xx errors.
        if (error.data?.code === "NOT_FOUND") {
          queryClient.removeQueries({
            queryKey: trpc.task.getById.queryKey({ id: variables.id })
          })
          await queryClient.invalidateQueries({
            queryKey: trpc.task.list.pathKey()
          })
        }
      }
    })
  )
}
