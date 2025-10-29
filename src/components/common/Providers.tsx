"use client";
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, 
      },
    },
  });
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-right" richColors  />
      </QueryClientProvider>
    </ThemeProvider>
  );
}


