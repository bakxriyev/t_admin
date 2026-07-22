"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type Lang } from "@/lib/translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  formLang: Lang;
  setFormLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "uz",
  setLang: () => {},
  formLang: "uz",
  setFormLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("uz");
  const [formLang, setFormLang] = useState<Lang>("uz");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("admin-lang") as Lang | null;
    if (saved && ["uz", "ru", "en"].includes(saved)) {
      setLang(saved);
    }
    const savedForm = localStorage.getItem("admin-form-lang") as Lang | null;
    if (savedForm && ["uz", "ru", "en"].includes(savedForm)) {
      setFormLang(savedForm);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin-lang", lang);
    }
  }, [lang, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("admin-form-lang", formLang);
    }
  }, [formLang, mounted]);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, formLang, setFormLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
