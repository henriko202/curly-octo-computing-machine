# Task Manager

An in-memory task manager built with **Next.js (App Router)**, **tRPC**, and **TanStack React Query**. Tasks live in
process memory, preloaded via SSR and paginated in 5-item increments with an infinite scroll.

---

## Quick Start

**Requirements:** Node.js 20+ and `pnpm` (or `npm`).

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Stack used

| Layer              | Used                                                                    | Why                                                                         |
|--------------------|-------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| Framework          | Next.js 16 (App Router) + React 19                                      | Dynamic SSR for `/` and `/tasks/[id]/edit`, thin route wrappers             |
| API                | tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`) | End-to-end TypeScript safety without codegen or manual REST clients         |
| Server State       | TanStack React Query v5                                                 | SSR hydration, infinite scroll caching, hover prefetching, invalidation     |
| Validation & Dates | Zod v4 + SuperJSON                                                      | Shared validation rules + native `Date` objects across SSR and client       |
| UI & Styling       | Tailwind CSS v4 + shadcn/ui + Sonner + Lucide                           | Accessible inputs, buttons, and toasts with minimal custom CSS              |
| i18n               | `i18next` + `react-i18next` + `i18next-http-backend`                    | English (`en`), Portuguese (`pt`), and Spanish (`es`) via `public/locales/` |
| Quality            | Vitest, ESLint 10, Prettier (`prettier-plugin-tailwindcss`)             | Fast unit/router tests, linting, and sorted Tailwind classes                |

---

## How It Works (Mental Model)

```text
Browser request (GET /)
  └─ Next.js Server Component (src/app/page.tsx)
       ├─ Loads locale JSON from public/locales/<lang>/*.json (cookie -> Accept-Language -> en)
       ├─ Calls tRPC in-process via createTRPCOptionsProxy (no HTTP hop)
       └─ Hydrates TanStack Query cache -> streams rendered HTML to browser

Browser interactions (scroll, create, edit, delete, hover)
  └─ TaskList components -> TaskListQueries / TaskListMutations (React Query + tRPC)
       └─ POST/GET /api/trpc/[trpc] -> taskRouter (Zod) -> InMemoryTaskStore (globalThis)
```

- **Pagination:** Keyset cursor pagination (`seq:<n>`) in **5-item increments**. Because cursors use a monotonic
  sequence number instead of array indexes, deleting a task mid-scroll never breaks the next page.
- **Hover prefetch:** Hovering or focusing **Create Task** prefetches `/tasks/new`; hovering or focusing **Edit**
  prefetches both `/tasks/[id]/edit` and the `task.getById` query cache.
- **Edit 404s:** `/tasks/[id]/edit` fetches on the server via `queryClient.query(...)` and calls Next.js `notFound()` on
  `NOT_FOUND` or `BAD_REQUEST`, returning a real HTTP 404 with no loading flash.

---

## Where Stuff Lives

The frontend uses **Locality of Behavior**: everything specific to the task feature lives together under
`src/components/TaskList/`, while Next.js routes under `src/app/` stay thin.

```text
public/locales/{en,pt,es}/     # Translation JSON files (common.json, tasks.json)
src/
├── app/                       # Thin Next.js routes + /api/trpc/[trpc] handler
├── server/                    # Backend: tRPC init, taskRouter, in-memory store
├── components/
│   ├── Header/                # Top navbar + EN/PT/ES LanguageSelector
│   ├── Shared/                # Composed cross-page UI (Layout, Alert, Button, Input, ErrorPage...)
│   └── TaskList/              # Feature module (Locality of Behavior)
│       ├── components/        # Presentational UI (TaskItem, TaskInfo, DeleteTask, Footer...)
│       ├── containers/        # Stateful views (TaskContainer, TaskForm, EditTaskContainer)
│       ├── domain/            # Feature constants, Task model, form schema & tests
│       ├── hooks/             # Feature-scoped TaskListProvider context
│       ├── mutations/         # TaskListMutations (create, update, delete)
│       ├── queries/           # TaskListQueries (load list, load one, hover prefetch)
│       └── index.tsx          # Public entrypoint for the feature
├── shared/                    # Raw shadcn/ui primitives (button, input, textarea, label, sonner)
├── i18n/                      # Locale config, server loader, client I18nProvider
├── types/                     # Shared Zod schema (task.ts) + inferred tRPC DTOs (trpc.ts)
├── styles/                    # Tailwind CSS v4 + shadcn theme tokens (globals.css)
└── utils/                     # cn, UTC date formatting, routes, useInfiniteScroll, tRPC setup
```

### "Where do I go to change X?"

| If you want to change...                        | Look here                                                      |
|-------------------------------------------------|----------------------------------------------------------------|
| Task CRUD logic or in-memory storage            | `src/server/routers/task.ts`, `src/server/store/task-store.ts` |
| Title/description validation rules or page size | `src/types/task.ts` (shared by backend and frontend)           |
| Task list UI, delete flow, or create/edit form  | `src/components/TaskList/`                                     |
| Copy or add a translation                       | `public/locales/{en,pt,es}/{common,tasks}.json`                |
| Base shadcn/ui component styles                 | `src/shared/` + `src/styles/globals.css`                       |
| App routes / URL builders                       | `src/utils/routes/index.ts`                                    |

---

## tRPC API (`taskRouter`)

| Procedure      | Type     | Input                                   | Behavior                                                                                                                    |
|----------------|----------|-----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `task.list`    | Query    | `{ limit?: 1..50, cursor?: "seq:<n>" }` | Returns `{ items, nextCursor, totalCount }` newest-first (default `limit: 5`). Malformed cursors return `BAD_REQUEST`.      |
| `task.getById` | Query    | `{ id }`                                | Returns one `Task` or throws `NOT_FOUND`.                                                                                   |
| `task.create`  | Mutation | `{ title, description? }`               | Trims fields, generates UUID + `createdAt`, prepends to store. Rejects empty title (`BAD_REQUEST`).                         |
| `task.update`  | Mutation | `{ id, title, description? }`           | Replaces title & description (omitting `description` clears it), keeps `id` and `createdAt`. Throws `NOT_FOUND` if missing. |
| `task.delete`  | Mutation | `{ id }`                                | Removes task and returns `{ deletedId }`. Throws `NOT_FOUND` if missing.                                                    |

---

## 5 Things to Know Before Touching the Code

1. **In-memory store lives on `globalThis` (even in production).** Next.js can bundle App Router pages and `/api/trpc`
   in separate module graphs. Pinning the singleton to `globalThis` ensures SSR and API mutations always hit the same
   store. Restarting the Node server resets all tasks to empty.
2. **`src/shared/` vs `src/components/Shared/`.** `src/shared/` is strictly for raw shadcn/ui primitives (wired in
   `components.json`). `src/components/Shared/` holds composed app components (`Layout`, `ErrorPage`, labeled `Input`/
   `Textarea`, loading-aware `Button`).
3. **One validation schema.** `taskFieldsSchema` in `src/types/task.ts` drives both the tRPC router and the client form
   (`TaskFormSchema.ts`), so limits and rules cannot drift.
4. **Concurrent-safe deletes & draft preservation.** Deletes use `mutateAsync` with per-ID `try/catch/finally` so
   clicking multiple deletes quickly never strands a spinner. Editing keeps the form mounted on background refresh
   errors so unsaved drafts are never wiped.
5. **Zero-flash i18n.** On SSR, `src/i18n/server.ts` reads JSON files directly from `public/locales/`. On language
   switch, `LanguageSelector` fetches the new JSON via `i18next-http-backend`, writes the `NEXT_LOCALE` cookie, and
   calls `router.refresh()` to sync server metadata.

---

## Scripts

| Command             | What it does                                                          |
|---------------------|-----------------------------------------------------------------------|
| `pnpm dev`          | Run Next.js dev server                                                |
| `pnpm build`        | Build production bundle                                               |
| `pnpm start`        | Run production server                                                 |
| `pnpm test`         | Run Vitest tests (tRPC CRUD, pagination, validation, i18n key parity) |
| `pnpm typecheck`    | Run TypeScript (`tsc --noEmit`)                                       |
| `pnpm lint`         | Run ESLint (`eslint-config-next` + `eslint-config-prettier`)          |
| `pnpm format`       | Format the codebase with Prettier + Tailwind class sorting            |
| `pnpm format:check` | Check Prettier formatting without editing files                       |
