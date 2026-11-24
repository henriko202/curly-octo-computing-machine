"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/utils/trpc/client"

export function useUpdateTask() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.task.update.mutationOptions({
      onSuccess: async updatedTask => {
        queryClient.setQueryData(trpc.task.getById.queryKey({ id: updatedTask.id }), updatedTask)
        await queryClient.invalidateQueries({
          queryKey: trpc.task.list.pathKey()
        })
      },
      onError: async (error, variables) => {
        // Invalidate (do not remove) the active getById query so EditTaskContainer keeps
        // its cached task draft mounted while surfacing the "Task no longer exists" banner.
        if (error.data?.code === "NOT_FOUND") {
          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: trpc.task.getById.queryKey({ id: variables.id })
            }),
            queryClient.invalidateQueries({
              queryKey: trpc.task.list.pathKey()
            })
          ])
        }
      }
    })
  )
}
