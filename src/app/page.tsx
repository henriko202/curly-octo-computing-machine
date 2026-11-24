import { DEFAULT_TASK_LIST_INPUT, getNextTaskPageParam, TaskList } from "@/components/TaskList"
import { getQueryClient, HydrateClient, trpc } from "@/utils/trpc/server"

/**
 * Force dynamic Server-Side Rendering on every request so the initial HTML
 * always reflects the current state of the in-memory task store.
 */
export const dynamic = "force-dynamic"

export default async function HomePage() {
  const queryClient = getQueryClient()

  // Preload the first page of tasks on the server before streaming HTML to the client.
  await queryClient
    .infiniteQuery(
      trpc.task.list.infiniteQueryOptions(DEFAULT_TASK_LIST_INPUT, {
        getNextPageParam: getNextTaskPageParam
      })
    )
    .catch(() => undefined)

  return (
    <HydrateClient>
      <TaskList />
    </HydrateClient>
  )
}
