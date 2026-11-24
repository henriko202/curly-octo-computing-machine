/**
 * Centralized application route paths and dynamic URL builders.
 * Keeping route definitions in one place avoids hardcoded strings across features
 * and makes future route metadata (titles, breadcrumbs, permissions) easy to attach.
 */
export const APP_ROUTES = {
  home: "/",
  tasks: {
    list: "/",
    new: "/tasks/new",
    edit: (id: string) => `/tasks/${encodeURIComponent(id)}/edit`
  }
} as const
