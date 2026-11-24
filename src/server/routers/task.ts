import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { decodeTaskCursor } from "@/server/store/task-store"
import { baseProcedure, createTRPCRouter } from "@/server/trpc"
import { DEFAULT_TASK_PAGE_SIZE, taskFieldsSchema } from "@/types/task"

const taskIdSchema = z.object({
  id: z.string().trim().min(1, "Task ID is required.")
})

const taskCursorSchema = z.string().refine(value => decodeTaskCursor(value) !== null, "Invalid pagination cursor.")

const listTasksInputSchema = z
  .object({
    limit: z.number().int().min(1, "Page size must be at least 1.").max(50, "Page size must be at most 50.").optional(),
    cursor: taskCursorSchema.optional()
  })
  .optional()

export const taskRouter = createTRPCRouter({
  /**
   * Returns a keyset cursor-paginated slice of tasks ordered newest-first.
   * Compatible with both standard queries and TanStack Query infinite scroll.
   */
  list: baseProcedure.input(listTasksInputSchema).query(({ ctx, input }) => {
    return ctx.taskStore.list({
      limit: input?.limit ?? DEFAULT_TASK_PAGE_SIZE,
      cursor: input?.cursor
    })
  }),

  /**
   * Fetches a single task by ID, returning NOT_FOUND if it does not exist.
   */
  getById: baseProcedure.input(taskIdSchema).query(({ ctx, input }) => {
    const task = ctx.taskStore.getById(input.id)

    if (!task) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found."
      })
    }

    return task
  }),

  /**
   * Creates a new task in memory after validating required fields.
   */
  create: baseProcedure.input(taskFieldsSchema).mutation(({ ctx, input }) => {
    return ctx.taskStore.create({
      title: input.title,
      description: input.description
    })
  }),

  /**
   * Replaces an existing task's title and description (omitting `description` clears it).
   */
  update: baseProcedure.input(taskIdSchema.extend(taskFieldsSchema.shape)).mutation(({ ctx, input }) => {
    const updated = ctx.taskStore.update(input.id, {
      title: input.title,
      description: input.description
    })

    if (!updated) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found. It may have been deleted."
      })
    }

    return updated
  }),

  /**
   * Deletes an existing task by ID.
   */
  delete: baseProcedure.input(taskIdSchema).mutation(({ ctx, input }) => {
    const deleted = ctx.taskStore.delete(input.id)

    if (!deleted) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Task not found. It may already have been deleted."
      })
    }

    return { deletedId: input.id }
  })
})
