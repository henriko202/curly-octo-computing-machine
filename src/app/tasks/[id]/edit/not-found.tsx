import { ErrorPage } from "@/components/Shared/ErrorPage"
import { getServerTranslation } from "@/i18n/server"
import { APP_ROUTES } from "@/utils/routes"

export default async function EditTaskNotFound() {
  const { t } = await getServerTranslation()

  return (
    <ErrorPage
      title={t("tasks:errors.notFoundTitle")}
      message={t("tasks:errors.notFoundMessage")}
      backHref={APP_ROUTES.tasks.list}
      backLabel={t("common:actions.backToTasks")}
    />
  )
}
