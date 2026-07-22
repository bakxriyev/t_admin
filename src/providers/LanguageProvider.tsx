"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
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
  const [lang, setLangState] = useState<Lang>("uz");
  const [formLang, setFormLangState] = useState<Lang>("uz");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("admin-lang") as Lang | null;
    if (saved && ["uz", "ru", "en"].includes(saved)) {
      setLangState(saved);
    }
    const savedForm = localStorage.getItem("admin-form-lang") as Lang | null;
    if (savedForm && ["uz", "ru", "en"].includes(savedForm)) {
      setFormLangState(savedForm);
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("admin-lang", l);
  }, []);

  const setFormLang = useCallback((l: Lang) => {
    setFormLangState(l);
    localStorage.setItem("admin-form-lang", l);
  }, []);

  const value = useMemo(() => ({ lang, setLang, formLang, setFormLang }), [lang, setLang, formLang, setFormLang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
