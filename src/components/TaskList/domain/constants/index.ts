import type { TaskFormValues } from "@/components/TaskList/domain/types/TaskFormSchema"
import { DEFAULT_TASK_PAGE_SIZE, TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH } from "@/types/task"
import type { TaskListPageDTO } from "@/types/trpc"

export { DEFAULT_TASK_PAGE_SIZE, TASK_DESCRIPTION_MAX_LENGTH, TASK_TITLE_MAX_LENGTH }

/**
 * Shared input and cursor selector for both SSR prefetching (`app/page.tsx`)
 * and client hydration (`useLoadTasks`), guaranteeing identical query keys.
 */
export const DEFAULT_TASK_LIST_INPUT = {
  limit: DEFAULT_TASK_PAGE_SIZE
} as const

export function getNextTaskPageParam(lastPage: TaskListPageDTO) {
  return lastPage.nextCursor
}

export const defaultEmptyTask: TaskFormValues = {
  title: "",
  description: ""
}
