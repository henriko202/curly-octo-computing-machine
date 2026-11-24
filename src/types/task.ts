import { z } from "zod"

export const TASK_TITLE_MAX_LENGTH = 120
export const TASK_DESCRIPTION_MAX_LENGTH = 1000
export const DEFAULT_TASK_PAGE_SIZE = 5

/**
 * Single source of truth for task field validation shared across
 * the tRPC backend router and client-side form validation.
 */
export const taskFieldsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Task title is required.")
    .max(TASK_TITLE_MAX_LENGTH, `Task title must be at most ${TASK_TITLE_MAX_LENGTH} characters.`),
  description: z
    .string()
    .trim()
    .max(TASK_DESCRIPTION_MAX_LENGTH, `Description must be at most ${TASK_DESCRIPTION_MAX_LENGTH} characters.`)
    .optional()
})

export interface Task {
  id: string
  title: string
  description?: string
  createdAt: Date
}

export interface CreateTaskInput {
  title: string
  description?: string
}

export interface TaskListPage {
  items: Task[]
  nextCursor?: string
  totalCount: number
}
