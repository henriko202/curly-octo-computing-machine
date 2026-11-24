"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/utils/trpc/client"

export function useCreateTask() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  return useMutation(
    trpc.task.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.task.list.pathKey()
        })
      }
    })
  )
}
