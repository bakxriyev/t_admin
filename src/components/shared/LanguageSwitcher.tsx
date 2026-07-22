"use client";

import { useLanguage } from "@/providers/LanguageProvider";
import { languages } from "@/lib/translations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <Select value={lang} onValueChange={(v) => setLang(v as "uz" | "ru" | "en")}>
      <SelectTrigger className="w-[130px] h-9 border-muted">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {languages.map((l) => (
          <SelectItem key={l.value} value={l.value}>
            <span className="flex items-center gap-2">
              <span className="text-xs opacity-60">{l.flag}</span>
              {l.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
