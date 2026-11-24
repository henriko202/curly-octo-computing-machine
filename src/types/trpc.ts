import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server"
import type { AppRouter } from "@/server/routers/_app"

export type { AppRouter }

export type RouterInputs = inferRouterInputs<AppRouter>
export type RouterOutputs = inferRouterOutputs<AppRouter>

// Inferred tRPC DTOs consumed by feature domain modules
export type TaskDTO = RouterOutputs["task"]["getById"]
export type TaskListPageDTO = RouterOutputs["task"]["list"]
export type ListTasksInputDTO = RouterInputs["task"]["list"]
