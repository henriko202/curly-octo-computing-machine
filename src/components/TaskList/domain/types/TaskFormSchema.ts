import type { TRPCClientErrorLike } from "@trpc/client"
import { z } from "zod"
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH, taskFieldsSchema } from "@/types/task"
import type { AppRouter } from "@/types/trpc"

/**
 * Client form schema derived directly from the shared `taskFieldsSchema`
 * so frontend and backend validation rules cannot drift.
 */
export const taskFormSchema = taskFieldsSchema.extend({
  description: taskFieldsSchema.shape.description.unwrap()
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

export interface TaskFormErrors {
  title?: string
  description?: string
}

export interface TaskValidationMessages {
  titleRequired: string
  titleMaxLength: string
  descriptionMaxLength: string
}

const DEFAULT_VALIDATION_MESSAGES: TaskValidationMessages = {
  titleRequired: "Task title is required.",
  titleMaxLength: `Task title must be at most ${TASK_TITLE_MAX_LENGTH} characters.`,
  descriptionMaxLength: `Description must be at most ${TASK_DESCRIPTION_MAX_LENGTH} characters.`
}

/**
 * Validates task form inputs on the client before triggering a tRPC mutation.
 * Accepts optional localized messages while enforcing the exact constraints of `taskFormSchema`.
 */
export function validateTaskForm(
  values: TaskFormValues,
  messages: TaskValidationMessages = DEFAULT_VALIDATION_MESSAGES
): TaskFormErrors {
  const result = taskFormSchema.safeParse(values)
  if (result.success) {
    return {}
  }

  const errors: TaskFormErrors = {}
  for (const issue of result.error.issues) {
    const field = issue.path[0]
    if (field === "title" && !errors.title) {
      errors.title = issue.code === "too_small" ? messages.titleRequired : messages.titleMaxLength
    } else if (field === "description" && !errors.description) {
      errors.description = messages.descriptionMaxLength
    }
  }

  return errors
}

export function hasValidationErrors(errors: TaskFormErrors): boolean {
  return Boolean(errors.title || errors.description)
}

/**
 * Extracts typed per-field validation messages returned by the backend tRPC errorFormatter.
 */
export function extractBackendFieldErrors(error: TRPCClientErrorLike<AppRouter>): TaskFormErrors {
  const fieldErrors = error.data?.zodError?.fieldErrors
  if (!fieldErrors) {
    return {}
  }

  return {
    title: fieldErrors.title?.[0],
    description: fieldErrors.description?.[0]
  }
}
