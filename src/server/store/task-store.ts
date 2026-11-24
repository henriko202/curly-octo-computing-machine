import { DEFAULT_TASK_PAGE_SIZE, type CreateTaskInput, type Task, type TaskListPage } from "@/types/task"

interface StoredTask {
  /** Monotonic sequence number used for deletion-resilient keyset pagination. */
  seq: number
  task: Task
}

const CURSOR_PREFIX = "seq:"
const CURSOR_PATTERN = /^seq:[1-9]\d*$/

function encodeCursor(seq: number): string {
  return `${CURSOR_PREFIX}${seq}`
}

export function decodeTaskCursor(cursor: string): number | null {
  if (!CURSOR_PATTERN.test(cursor)) return null
  const parsed = Number(cursor.slice(CURSOR_PREFIX.length))
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null
}

/**
 * Normalize optional descriptions so whitespace-only values are stored as undefined.
 */
function normalizeDescription(description?: string): string | undefined {
  if (description === undefined) return undefined
  const trimmed = description.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

class InMemoryTaskStore {
  private entries: StoredTask[] = []
  private nextSeq = 1

  constructor(initialTasks: Task[] = []) {
    this.reset(initialTasks)
  }

  /**
   * Keyset cursor-paginated listing ordered newest-first (descending `seq`).
   * Because the cursor encodes the last returned item's monotonic sequence number,
   * deleting the boundary item between page requests still resumes cleanly at the
   * next surviving task instead of truncating the list.
   */
  list(params?: { limit?: number; cursor?: string }): TaskListPage {
    const limit = params?.limit ?? DEFAULT_TASK_PAGE_SIZE
    const cursor = params?.cursor
    const totalCount = this.entries.length

    let candidates = this.entries
    if (cursor) {
      const cursorSeq = decodeTaskCursor(cursor)
      if (cursorSeq === null) {
        return {
          items: [],
          nextCursor: undefined,
          totalCount
        }
      }
      candidates = this.entries.filter(entry => entry.seq < cursorSeq)
    }

    const slice = candidates.slice(0, limit + 1)
    const hasMore = slice.length > limit
    const pageEntries = hasMore ? slice.slice(0, limit) : slice
    const lastEntry = pageEntries.at(-1)

    return {
      items: pageEntries.map(entry => ({ ...entry.task })),
      nextCursor: hasMore && lastEntry ? encodeCursor(lastEntry.seq) : undefined,
      totalCount
    }
  }

  getById(id: string): Task | undefined {
    const found = this.entries.find(entry => entry.task.id === id)
    return found ? { ...found.task } : undefined
  }

  create(input: CreateTaskInput): Task {
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title.trim(),
      description: normalizeDescription(input.description),
      createdAt: new Date()
    }

    this.entries.unshift({ seq: this.nextSeq++, task })
    return { ...task }
  }

  update(id: string, input: CreateTaskInput): Task | undefined {
    const index = this.entries.findIndex(entry => entry.task.id === id)
    if (index === -1) {
      return undefined
    }

    const existing = this.entries[index]
    const updated: Task = {
      ...existing.task,
      title: input.title.trim(),
      description: normalizeDescription(input.description)
    }

    this.entries[index] = { ...existing, task: updated }
    return { ...updated }
  }

  delete(id: string): boolean {
    const index = this.entries.findIndex(entry => entry.task.id === id)
    if (index === -1) {
      return false
    }

    this.entries.splice(index, 1)
    return true
  }

  /**
   * Resets the in-memory dataset (defaults to an empty task list).
   * Assigns descending sequence numbers so index 0 is the newest task.
   */
  reset(initialTasks: Task[] = []): void {
    const total = initialTasks.length
    this.entries = initialTasks.map((task, index) => ({
      seq: total - index,
      task: { ...task }
    }))
    this.nextSeq = total + 1
  }
}

/**
 * Unconditionally attach the singleton store to `globalThis`.
 * In Next.js App Router, both development HMR and production bundles can load
 * RSC pages and `/api/trpc` route handlers in separate module graphs; sharing
 * through `globalThis` guarantees SSR and API mutations always hit the same
 * process-local store.
 */
const globalForTaskStore = globalThis as unknown as {
  __taskManagerStore?: InMemoryTaskStore
}

export const taskStore =
  globalForTaskStore.__taskManagerStore ?? (globalForTaskStore.__taskManagerStore = new InMemoryTaskStore())
