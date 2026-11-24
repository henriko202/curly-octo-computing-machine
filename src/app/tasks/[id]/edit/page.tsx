import { TRPCError } from "@trpc/server"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { EditTaskContainer } from "@/components/TaskList"
import { getServerTranslation } from "@/i18n/server"
import { getQueryClient, HydrateClient, trpc } from "@/utils/trpc/server"

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslation()
  return {
    title: `${t("tasks:editTask")} | ${t("common:appName")}`
  }
}

interface EditTaskPageProps {
  params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const queryClient = getQueryClient()

  try {
    await queryClient.query(trpc.task.getById.queryOptions({ id }))
  } catch (error) {
    if (error instanceof TRPCError && (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")) {
      notFound()
    }
    throw error
  }

  return (
    <HydrateClient>
      <EditTaskContainer taskId={id} />
    </HydrateClient>
  )
}
