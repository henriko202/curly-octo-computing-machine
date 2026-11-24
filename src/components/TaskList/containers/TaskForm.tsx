"use client"

import type { TRPCClientErrorLike } from "@trpc/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, type SubmitEvent } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"
import { Alert } from "@/components/Shared/Alert"
import { Button } from "@/components/Shared/Button"
import { Input } from "@/components/Shared/Input"
import { Textarea } from "@/components/Shared/Textarea"
import {
  defaultEmptyTask,
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH
} from "@/components/TaskList/domain/constants"
import type { Task } from "@/components/TaskList/domain/models/Task"
import {
  extractBackendFieldErrors,
  hasValidationErrors,
  validateTaskForm,
  type TaskFormErrors,
  type TaskValidationMessages
} from "@/components/TaskList/domain/types/TaskFormSchema"
import { TaskListMutations } from "@/components/TaskList/mutations"
import type { AppRouter } from "@/types/trpc"
import { APP_ROUTES } from "@/utils/routes"

type TaskFormProps =
  | {
      mode: "create"
      initialTask?: undefined
    }
  | {
      mode: "edit"
      initialTask: Task
    }

export function TaskForm({ mode, initialTask }: TaskFormProps) {
  const router = useRouter()
  const { t } = useTranslation(["common", "tasks"])

  const [title, setTitle] = useState(initialTask?.title ?? defaultEmptyTask.title)
  const [description, setDescription] = useState(initialTask?.description ?? defaultEmptyTask.description)
  const [fieldErrors, setFieldErrors] = useState<TaskFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  const createTask = TaskListMutations.useCreateTask()
  const updateTask = TaskListMutations.useUpdateTask()

  const validationMessages = useMemo<TaskValidationMessages>(
    () => ({
      titleRequired: t("tasks:form.validation.titleRequired"),
      titleMaxLength: t("tasks:form.validation.titleMaxLength", {
        max: TASK_TITLE_MAX_LENGTH
      }),
      descriptionMaxLength: t("tasks:form.validation.descriptionMaxLength", {
        max: TASK_DESCRIPTION_MAX_LENGTH
      })
    }),
    [t]
  )

  // Keep the form disabled after success while Next.js navigates back to the list
  // so rapid double-clicks cannot submit a duplicate task.
  const isSubmitting = createTask.isPending || createTask.isSuccess || updateTask.isPending || updateTask.isSuccess

  function revalidateIfSubmitted(nextTitle: string, nextDescription: string) {
    if (!hasSubmitted) return
    setFieldErrors(validateTaskForm({ title: nextTitle, description: nextDescription }, validationMessages))
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    setFormError(null)
    revalidateIfSubmitted(value, description)
  }

  function handleDescriptionChange(value: string) {
    setDescription(value)
    setFormError(null)
    revalidateIfSubmitted(title, value)
  }

  function handleMutationError(error: TRPCClientErrorLike<AppRouter>) {
    const backendFieldErrors = extractBackendFieldErrors(error)
    const hasFieldErrors = hasValidationErrors(backendFieldErrors)

    if (hasFieldErrors) {
      setFieldErrors(backendFieldErrors)
    }

    // Avoid surfacing raw stringified ZodIssue JSON in alerts/toasts for any Zod error.
    const zodError = error.data?.zodError
    const message = hasFieldErrors
      ? t("tasks:form.validation.fixHighlightedFields")
      : zodError
        ? zodError.formErrors[0] || t("tasks:form.validation.checkInput")
        : error.data?.code === "NOT_FOUND"
          ? t("tasks:errors.notFoundMessage")
          : error.message || (mode === "create" ? t("tasks:errors.createFallback") : t("tasks:errors.updateFallback"))

    setFormError(message)
    toast.error(message)
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setHasSubmitted(true)
    setFormError(null)

    const validationErrors = validateTaskForm({ title, description }, validationMessages)
    setFieldErrors(validationErrors)

    if (hasValidationErrors(validationErrors)) {
      return
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined
    }

    if (mode === "create") {
      createTask.mutate(payload, {
        onSuccess: () => {
          toast.success(t("tasks:toasts.created"))
          router.push(APP_ROUTES.tasks.list)
        },
        onError: handleMutationError
      })
    } else {
      updateTask.mutate(
        { id: initialTask.id, ...payload },
        {
          onSuccess: () => {
            toast.success(t("tasks:toasts.updated"))
            router.push(APP_ROUTES.tasks.list)
          },
          onError: handleMutationError
        }
      )
    }
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <Link
          href={APP_ROUTES.tasks.list}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />
          <span>{t("common:actions.backToTasks")}</span>
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {mode === "create" ? t("tasks:createTask") : t("tasks:editTask")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "create" ? t("tasks:form.createSubtitle") : t("tasks:form.editSubtitle")}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        {formError && (
          <Alert
            variant="error"
            title={t("tasks:errors.saveTitle")}>
            {formError}
          </Alert>
        )}

        <Input
          id="task-title"
          name="title"
          label={t("tasks:form.fields.titleLabel")}
          required
          placeholder={t("tasks:form.fields.titlePlaceholder")}
          value={title}
          onChange={event => handleTitleChange(event.target.value)}
          disabled={isSubmitting}
          error={fieldErrors.title}
          characterCount={{
            current: title.trim().length,
            max: TASK_TITLE_MAX_LENGTH
          }}
          autoFocus
        />

        <Textarea
          id="task-description"
          name="description"
          label={t("tasks:form.fields.descriptionLabel")}
          rows={4}
          placeholder={t("tasks:form.fields.descriptionPlaceholder")}
          value={description}
          onChange={event => handleDescriptionChange(event.target.value)}
          disabled={isSubmitting}
          error={fieldErrors.description}
          helperText={t("tasks:form.fields.descriptionHelper")}
          characterCount={{
            current: description.trim().length,
            max: TASK_DESCRIPTION_MAX_LENGTH
          }}
        />

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            variant="secondary"
            asChild>
            <Link href={APP_ROUTES.tasks.list}>{t("common:actions.cancel")}</Link>
          </Button>

          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingText={mode === "create" ? t("common:states.creating") : t("common:states.saving")}>
            {mode === "create" ? t("tasks:createTask") : t("common:actions.saveChanges")}
          </Button>
        </div>
      </form>
    </section>
  )
}
