"use client"

import { Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { DeleteTask } from "@/components/TaskList/components/DeleteTask"
import { TaskInfo } from "@/components/TaskList/components/TaskInfo"
import type { Task } from "@/components/TaskList/domain/models/Task"
import { TaskListQueries } from "@/components/TaskList/queries"
import { Button } from "@/shared/button"
import { APP_ROUTES } from "@/utils/routes"

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const router = useRouter()
  const { t } = useTranslation("common")
  const prefetchTask = TaskListQueries.usePrefetchTask()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const editHref = APP_ROUTES.tasks.edit(task.id)

  const handlePrefetchEdit = useCallback(() => {
    router.prefetch(editHref)
    prefetchTask(task.id)
  }, [editHref, prefetchTask, router, task.id])

  return (
    <article className="group rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-colors hover:border-slate-300 sm:p-5">
      <TaskInfo
        task={task}
        actions={
          <>
            {!confirmingDelete && (
              <Button
                variant="outline"
                size="sm"
                asChild>
                <Link
                  href={editHref}
                  prefetch={false}
                  onMouseEnter={handlePrefetchEdit}
                  onFocus={handlePrefetchEdit}>
                  <Pencil
                    className="size-3.5"
                    aria-hidden="true"
                  />
                  <span>{t("actions.edit")}</span>
                </Link>
              </Button>
            )}

            <DeleteTask
              taskId={task.id}
              taskTitle={task.title}
              isConfirming={confirmingDelete}
              onConfirmingChange={setConfirmingDelete}
            />
          </>
        }
      />
    </article>
  )
}
