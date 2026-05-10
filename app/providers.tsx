// we had:

// createRouter({
//   context: { queryClient },
// })

// In Next.js:

// use React Query normally:
// <QueryClientProvider client={queryClient}></QueryClientProvider>
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { ThemeProvider } from "./lib/theme";
import { AuthProvider } from "./lib/auth";
import { Toaster } from "./components/ui/sonner";

export function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}

          <Toaster
            richColors
            position="top-right"
          />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}