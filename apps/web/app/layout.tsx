import type { Metadata } from "next"
import "@dev-hoster/ui/globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: { default: "Dev Hoster", template: "%s · Dev Hoster" },
  description: "Deploy a Git repo and get a live URL.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-svh bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
