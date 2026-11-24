import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type { ReactNode } from "react"
import { Header } from "@/components/Header"
import { Layout } from "@/components/Shared/Layout"
import { I18nProvider } from "@/i18n/I18nProvider"
import { getServerTranslation } from "@/i18n/server"
import { Toaster } from "@/shared/sonner"
import "@/styles/globals.css"
import { TRPCReactProvider } from "@/utils/trpc/client"

const inter = Inter({
  subsets: ["latin"],
  display: "swap"
})

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslation()
  return {
    title: t("common:appName"),
    description: t("common:appDescription")
  }
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { locale, resources } = await getServerTranslation()

  return (
    <html
      lang={locale}
      className={inter.className}>
      <body className="min-h-screen">
        <I18nProvider
          initialLocale={locale}
          initialResources={resources}>
          <TRPCReactProvider>
            <Layout header={<Header />}>{children}</Layout>
            <Toaster
              position="bottom-right"
              richColors
              closeButton
            />
          </TRPCReactProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
