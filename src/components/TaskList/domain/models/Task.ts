import type { TaskDTO } from "@/types/trpc"

/**
 * Frontend domain model for a Task, derived from the tRPC router output.
 * Extend this type if UI-only computed attributes are needed in the future.
 */
export type Task = TaskDTO
