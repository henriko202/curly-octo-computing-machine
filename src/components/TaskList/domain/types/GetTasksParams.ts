import type { ListTasksInputDTO } from "@/types/trpc"

export type GetTasksParams = Exclude<ListTasksInputDTO, void | undefined>
