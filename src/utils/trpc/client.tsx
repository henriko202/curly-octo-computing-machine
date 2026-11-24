"use client"

import "client-only"
import { QueryClientProvider, type QueryClient } from "@tanstack/react-query"
import { createTRPCClient, httpBatchLink } from "@trpc/client"
import { createTRPCContext } from "@trpc/tanstack-react-query"
import { useState, type ReactNode } from "react"
import superjson from "superjson"
import type { AppRouter } from "@/server/routers/_app"
import { makeQueryClient } from "@/utils/trpc/query-client"

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a fresh QueryClient per request.
    return makeQueryClient()
  }
  // Browser: reuse a singleton QueryClient so React re-renders preserve cache state.
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient()
  }
  return browserQueryClient
}

export function TRPCReactProvider({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: "/api/trpc"
        })
      ]
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider
        trpcClient={trpcClient}
        queryClient={queryClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  )
}
