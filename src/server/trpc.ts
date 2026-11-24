import { initTRPC } from "@trpc/server"
import superjson from "superjson"
import { z, ZodError } from "zod"
import { taskStore } from "@/server/store/task-store"

/**
 * Creates the per-request server tRPC context.
 * Injecting `taskStore` here keeps procedures decoupled from module globals
 * and straightforward to test.
 */
export async function createServerTRPCContext() {
  return {
    taskStore
  }
}

export type ServerTRPCContext = Awaited<ReturnType<typeof createServerTRPCContext>>

const t = initTRPC.context<ServerTRPCContext>().create({
  transformer: superjson,
  /**
   * Expose flattened Zod validation details on client errors so forms can map
   * backend validation failures back to individual fields when needed.
   */
  errorFormatter({ shape, error }) {
    const flattened = error.cause instanceof ZodError ? z.flattenError(error.cause) : null

    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: flattened
          ? {
              formErrors: flattened.formErrors,
              fieldErrors: flattened.fieldErrors as Record<string, string[] | undefined>
            }
          : null
      }
    }
  }
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory
export const baseProcedure = t.procedure
