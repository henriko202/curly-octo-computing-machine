import { createCallerFactory, createTRPCRouter } from "@/server/trpc"
import { taskRouter } from "@/server/routers/task"

export const appRouter = createTRPCRouter({
  task: taskRouter
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
