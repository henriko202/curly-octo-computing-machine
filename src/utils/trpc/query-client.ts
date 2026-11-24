import { QueryClient } from "@tanstack/react-query"
import superjson from "superjson"

/**
 * Deterministic 4xx tRPC error codes that should not be retried automatically.
 * Intentionally excludes `TIMEOUT` (HTTP 408), which is transient and safe to retry once.
 */
const NON_RETRYABLE_TRPC_CODES = new Set([
  "BAD_REQUEST",
  "PARSE_ERROR",
  "UNAUTHORIZED",
  "PAYMENT_REQUIRED",
  "FORBIDDEN",
  "NOT_FOUND",
  "METHOD_NOT_SUPPORTED",
  "CONFLICT",
  "PRECONDITION_FAILED",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "UNPROCESSABLE_CONTENT",
  "PRECONDITION_REQUIRED",
  "TOO_MANY_REQUESTS",
  "CLIENT_CLOSED_REQUEST"
])

function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false

  // Skip retries for non-transient 4xx tRPC errors (both server TRPCError and client TRPCClientError).
  if (error && typeof error === "object") {
    const clientData = (error as { data?: { code?: string; httpStatus?: number } }).data

    if (
      typeof clientData?.httpStatus === "number" &&
      clientData.httpStatus >= 400 &&
      clientData.httpStatus < 500 &&
      clientData.httpStatus !== 408
    ) {
      return false
    }

    const serverCode = (error as { code?: string }).code
    const code = clientData?.code ?? serverCode

    if (code && NON_RETRYABLE_TRPC_CODES.has(code)) {
      return false
    }
  }

  return true
}

/**
 * Shared TanStack QueryClient factory used on both the server (for SSR prefetching)
 * and the browser. SuperJSON preserves Date instances across SSR hydration.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Keep prefetched SSR data fresh for 30s to avoid redundant immediate refetches.
        staleTime: 30 * 1000,
        retry: shouldRetryQuery
      },
      dehydrate: {
        serializeData: superjson.serialize
      },
      hydrate: {
        deserializeData: superjson.deserialize
      }
    }
  })
}
