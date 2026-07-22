"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "./ThemeProvider";
import { LanguageProvider } from "./LanguageProvider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        <LanguageProvider>
          {children}
          <Toaster position="top-right" richColors closeButton />
        </LanguageProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
