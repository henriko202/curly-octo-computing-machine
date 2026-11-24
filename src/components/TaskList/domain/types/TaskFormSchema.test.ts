import type { TRPCClientErrorLike } from "@trpc/client"
import { describe, expect, it } from "vitest"
import { TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@/components/TaskList/domain/constants"
import {
  extractBackendFieldErrors,
  hasValidationErrors,
  validateTaskForm
} from "@/components/TaskList/domain/types/TaskFormSchema"
import type { AppRouter } from "@/types/trpc"

describe("TaskFormSchema", () => {
  it("requires a non-empty title", () => {
    const errors = validateTaskForm({ title: "   ", description: "" })
    expect(errors.title).toBe("Task title is required.")
    expect(hasValidationErrors(errors)).toBe(true)
  })

  it("accepts a valid title with optional description", () => {
    const errors = validateTaskForm({
      title: "Ship feature",
      description: ""
    })
    expect(errors).toEqual({})
    expect(hasValidationErrors(errors)).toBe(false)
  })

  it("enforces max lengths for title and description", () => {
    const errors = validateTaskForm({
      title: "x".repeat(TASK_TITLE_MAX_LENGTH + 1),
      description: "y".repeat(TASK_DESCRIPTION_MAX_LENGTH + 1)
    })

    expect(errors.title).toContain(String(TASK_TITLE_MAX_LENGTH))
    expect(errors.description).toContain(String(TASK_DESCRIPTION_MAX_LENGTH))
    expect(hasValidationErrors(errors)).toBe(true)
  })

  it("extracts flattened Zod field errors from typed tRPC client errors", () => {
    const mockError = {
      message: "Validation failed",
      data: {
        code: "BAD_REQUEST",
        httpStatus: 400,
        zodError: {
          formErrors: [],
          fieldErrors: {
            title: ["Task title is required."]
          }
        }
      }
    } as unknown as TRPCClientErrorLike<AppRouter>

    expect(extractBackendFieldErrors(mockError)).toEqual({
      title: "Task title is required.",
      description: undefined
    })
  })
})
