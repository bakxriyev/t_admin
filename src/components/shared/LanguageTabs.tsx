"use client";

import { useLanguage } from "@/providers/LanguageProvider";

interface LanguageTabsProps {
  children: (lang: string) => React.ReactNode;
}

const ALL_LANGS = ["uz", "ru", "en"];

export function LanguageTabs({ children }: LanguageTabsProps) {
  const { formLang } = useLanguage();
  return (
    <>
      {ALL_LANGS.map((l) => (
        <div key={l} style={{ display: l === formLang ? "block" : "none" }}>
          {children(l)}
        </div>
      ))}
    </>
  );
}
