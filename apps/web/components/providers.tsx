"use client"

import { useEffect, useState } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@dev-hoster/ui/components/sonner"
import { TooltipProvider } from "@dev-hoster/ui/components/tooltip"
import { ApiError } from "@/lib/api/client"
import { useUiStore } from "@/lib/stores/ui-store"
import { ThemeProvider } from "@/components/theme-provider"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5_000,
        refetchOnWindowFocus: true,
        // Don't retry 4xx (missing project, validation); do retry flaky 5xx.
        retry: (count, err) =>
          !(err instanceof ApiError && err.status < 500) && count < 2,
      },
    },
  })
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(makeQueryClient)

  useEffect(() => {
    void useUiStore.persist.rehydrate()
  }, [])

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
