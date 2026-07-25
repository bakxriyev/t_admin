"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "./LanguageProvider";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </LanguageProvider>
    </SessionProvider>
  );
}
