import type { Metadata } from "next"
import { TaskForm } from "@/components/TaskList"
import { getServerTranslation } from "@/i18n/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslation()
  return {
    title: `${t("tasks:createTask")} | ${t("common:appName")}`
  }
}

export default function NewTaskPage() {
  return <TaskForm mode="create" />
}
