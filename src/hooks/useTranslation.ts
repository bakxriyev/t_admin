import { useLanguage } from "@/providers/LanguageProvider";
import { t } from "@/lib/translations";

export function useTranslation() {
  const { lang } = useLanguage();
  return {
    t: (key: string) => t(key, lang),
    lang,
  };
}
