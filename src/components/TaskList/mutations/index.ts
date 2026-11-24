import { useCreateTask } from "@/components/TaskList/mutations/useCreateTask"
import { useDeleteTask } from "@/components/TaskList/mutations/useDeleteTask"
import { useUpdateTask } from "@/components/TaskList/mutations/useUpdateTask"

export const TaskListMutations = {
  useCreateTask,
  useUpdateTask,
  useDeleteTask
}
