"use client"

import { useTranslation } from "react-i18next"
import { Alert } from "@/components/Shared/Alert"
import { Button } from "@/components/Shared/Button"
import { Spinner } from "@/components/Shared/Spinner"
import { useTaskListContext } from "@/components/TaskList/hooks/context"

export function TaskListFooter() {
  const { t } = useTranslation("tasks")
  const { sentinelRef, totalCount, isFetching, hasNextPage, isFetchingNextPage, isFetchNextPageError, loadMore } =
    useTaskListContext()

  return (
    <div
      ref={sentinelRef}
      className="pt-2">
      {isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500">
          <Spinner size="sm" />
          <span>{t("list.loadingMore")}</span>
        </div>
      )}

      {isFetchNextPageError && (
        <Alert
          variant="error"
          title={t("errors.loadMoreTitle")}
          action={
            <Button
              variant="secondary"
              size="sm"
              disabled={isFetching}
              onClick={loadMore}>
              {t("list.tryAgain")}
            </Button>
          }>
          {t("errors.loadMoreMessage")}
        </Alert>
      )}

      {hasNextPage && !isFetchingNextPage && !isFetchNextPageError && (
        <div className="flex justify-center py-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={isFetching}
            onClick={loadMore}>
            {t("list.loadMore")}
          </Button>
        </div>
      )}

      {!hasNextPage && (
        <p className="py-4 text-center text-xs text-slate-400">{t("list.allLoaded", { count: totalCount })}</p>
      )}
    </div>
  )
}
