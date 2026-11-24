import { useLoadTask } from "@/components/TaskList/queries/useLoadTask"
import { useLoadTasks } from "@/components/TaskList/queries/useLoadTasks"
import { usePrefetchTask } from "@/components/TaskList/queries/usePrefetchTask"

export const TaskListQueries = {
  useLoadTask,
  useLoadTasks,
  usePrefetchTask
}
