import { TRPCError } from "@trpc/server"
import { beforeEach, describe, expect, it } from "vitest"
import { createCaller } from "@/server/routers/_app"
import { taskStore } from "@/server/store/task-store"
import { createServerTRPCContext } from "@/server/trpc"
import { TASK_TITLE_MAX_LENGTH } from "@/types/task"

async function createTestCaller() {
  const ctx = await createServerTRPCContext()
  return createCaller(ctx)
}

describe("taskRouter", () => {
  beforeEach(() => {
    taskStore.reset([
      {
        id: "task-1",
        title: "First task",
        description: "First description",
        createdAt: new Date("2026-01-03T10:00:00.000Z")
      },
      {
        id: "task-2",
        title: "Second task",
        createdAt: new Date("2026-01-02T10:00:00.000Z")
      },
      {
        id: "task-3",
        title: "Third task",
        description: "Third description",
        createdAt: new Date("2026-01-01T10:00:00.000Z")
      },
      {
        id: "task-4",
        title: "Fourth task",
        createdAt: new Date("2025-12-31T10:00:00.000Z")
      }
    ])
  })

  describe("list", () => {
    it("returns paginated tasks and nextCursor for infinite scroll", async () => {
      const caller = await createTestCaller()

      const firstPage = await caller.task.list({ limit: 2 })
      expect(firstPage.items.map(item => item.id)).toEqual(["task-1", "task-2"])
      expect(firstPage.nextCursor).toBeTruthy()
      expect(firstPage.totalCount).toBe(4)

      const secondPage = await caller.task.list({
        limit: 2,
        cursor: firstPage.nextCursor
      })
      expect(secondPage.items.map(item => item.id)).toEqual(["task-3", "task-4"])
      expect(secondPage.nextCursor).toBeUndefined()
      expect(secondPage.totalCount).toBe(4)
    })

    it("continues pagination cleanly even if the boundary or next task is deleted between pages", async () => {
      const caller = await createTestCaller()

      const firstPage = await caller.task.list({ limit: 2 })
      expect(firstPage.items.map(item => item.id)).toEqual(["task-1", "task-2"])
      expect(firstPage.nextCursor).toBeTruthy()

      // Delete both the last item on page 1 and the first unseen item before requesting page 2.
      await caller.task.delete({ id: "task-2" })
      await caller.task.delete({ id: "task-3" })

      const secondPage = await caller.task.list({
        limit: 2,
        cursor: firstPage.nextCursor
      })
      expect(secondPage.items.map(item => item.id)).toEqual(["task-4"])
      expect(secondPage.nextCursor).toBeUndefined()
      expect(secondPage.totalCount).toBe(2)
    })

    it("returns default list when called without arguments and paginates in increments of 5", async () => {
      const caller = await createTestCaller()
      taskStore.reset(
        Array.from({ length: 7 }, (_, index) => ({
          id: `task-${index + 1}`,
          title: `Task ${index + 1}`,
          createdAt: new Date(2026, 0, 7 - index)
        }))
      )

      const firstPage = await caller.task.list()
      expect(firstPage.items).toHaveLength(5)
      expect(firstPage.nextCursor).toBeTruthy()
      expect(firstPage.totalCount).toBe(7)

      const secondPage = await caller.task.list({
        cursor: firstPage.nextCursor
      })
      expect(secondPage.items).toHaveLength(2)
      expect(secondPage.nextCursor).toBeUndefined()
    })

    it("starts empty when reset with default state", async () => {
      const caller = await createTestCaller()
      taskStore.reset()

      const result = await caller.task.list()
      expect(result.items).toEqual([])
      expect(result.nextCursor).toBeUndefined()
      expect(result.totalCount).toBe(0)
    })

    it("rejects malformed or out-of-range pagination cursors with BAD_REQUEST", async () => {
      const caller = await createTestCaller()

      await expect(caller.task.list({ cursor: "not-a-valid-cursor" })).rejects.toMatchObject({
        code: "BAD_REQUEST"
      })

      await expect(caller.task.list({ cursor: "seq:9007199254740992" })).rejects.toMatchObject({
        code: "BAD_REQUEST"
      })
    })
  })

  describe("getById", () => {
    it("returns the matching task", async () => {
      const caller = await createTestCaller()
      const task = await caller.task.getById({ id: "task-1" })

      expect(task.id).toBe("task-1")
      expect(task.title).toBe("First task")
      expect(task.description).toBe("First description")
      expect(task.createdAt).toBeInstanceOf(Date)
    })

    it("throws NOT_FOUND when task does not exist", async () => {
      const caller = await createTestCaller()

      await expect(caller.task.getById({ id: "missing-id" })).rejects.toMatchObject({
        code: "NOT_FOUND"
      })
    })
  })

  describe("create", () => {
    it("creates a new task with trimmed fields and prepends it to the list", async () => {
      const caller = await createTestCaller()

      const created = await caller.task.create({
        title: "  Write integration tests  ",
        description: "  Verify CRUD operations  "
      })

      expect(created.id).toBeTruthy()
      expect(created.title).toBe("Write integration tests")
      expect(created.description).toBe("Verify CRUD operations")
      expect(created.createdAt).toBeInstanceOf(Date)

      const list = await caller.task.list()
      expect(list.items[0]?.id).toBe(created.id)
      expect(list.totalCount).toBe(5)
    })

    it("normalizes whitespace-only descriptions to undefined", async () => {
      const caller = await createTestCaller()

      const created = await caller.task.create({
        title: "Title only task",
        description: "    "
      })

      expect(created.description).toBeUndefined()
    })

    it("rejects tasks without a title or with whitespace-only title", async () => {
      const caller = await createTestCaller()

      await expect(caller.task.create({ title: "" })).rejects.toBeInstanceOf(TRPCError)
      await expect(caller.task.create({ title: "   " })).rejects.toMatchObject({
        code: "BAD_REQUEST"
      })
    })

    it("rejects titles exceeding the maximum length", async () => {
      const caller = await createTestCaller()

      await expect(caller.task.create({ title: "a".repeat(TASK_TITLE_MAX_LENGTH + 1) })).rejects.toMatchObject({
        code: "BAD_REQUEST"
      })
    })
  })

  describe("update", () => {
    it("updates an existing task while preserving id and createdAt", async () => {
      const caller = await createTestCaller()
      const before = await caller.task.getById({ id: "task-1" })

      const updated = await caller.task.update({
        id: "task-1",
        title: "Updated title",
        description: "Updated description"
      })

      expect(updated.id).toBe(before.id)
      expect(updated.createdAt.getTime()).toBe(before.createdAt.getTime())
      expect(updated.title).toBe("Updated title")
      expect(updated.description).toBe("Updated description")
    })

    it("throws NOT_FOUND when updating a non-existent task", async () => {
      const caller = await createTestCaller()

      await expect(
        caller.task.update({
          id: "does-not-exist",
          title: "Valid title"
        })
      ).rejects.toMatchObject({
        code: "NOT_FOUND"
      })
    })

    it("rejects update with an empty title", async () => {
      const caller = await createTestCaller()

      await expect(
        caller.task.update({
          id: "task-1",
          title: "   "
        })
      ).rejects.toMatchObject({
        code: "BAD_REQUEST"
      })
    })
  })

  describe("delete", () => {
    it("deletes an existing task and updates totalCount", async () => {
      const caller = await createTestCaller()

      const result = await caller.task.delete({ id: "task-2" })
      expect(result).toEqual({ deletedId: "task-2" })

      const list = await caller.task.list()
      expect(list.totalCount).toBe(3)
      expect(list.items.map(item => item.id)).toEqual(["task-1", "task-3", "task-4"])
    })

    it("throws NOT_FOUND when deleting a missing task", async () => {
      const caller = await createTestCaller()

      await expect(caller.task.delete({ id: "non-existent" })).rejects.toMatchObject({
        code: "NOT_FOUND"
      })
    })
  })
})
