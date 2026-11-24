import "server-only"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query"
import { cache, type ReactNode } from "react"
import { appRouter } from "@/server/routers/_app"
import { createServerTRPCContext } from "@/server/trpc"
import { makeQueryClient } from "@/utils/trpc/query-client"

/**
 * Request-scoped QueryClient singleton using React's `cache` so Server Components
 * in the same render pass share prefetched query data.
 */
export const getQueryClient = cache(makeQueryClient)

/**
 * Server-side tRPC proxy that invokes procedures directly in-process (no HTTP hop)
 * and produces query/infiniteQuery options compatible with TanStack Query SSR.
 */
export const trpc = createTRPCOptionsProxy({
  ctx: createServerTRPCContext,
  router: appRouter,
  queryClient: getQueryClient
})

export function HydrateClient({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  return <HydrationBoundary state={dehydrate(queryClient)}>{children}</HydrationBoundary>
}
