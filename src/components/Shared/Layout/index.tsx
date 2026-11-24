import type { ReactNode } from "react"

interface LayoutProps {
  header?: ReactNode
  children: ReactNode
}

export function Layout({ header, children }: LayoutProps) {
  return (
    <>
      {header}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</main>
    </>
  )
}
