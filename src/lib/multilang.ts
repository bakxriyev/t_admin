import { z } from "zod";

export const MULTILANG_LANGUAGES = ["uz", "ru", "en"] as const;

export type MultilangLanguage = (typeof MULTILANG_LANGUAGES)[number];

export function hasText(value: unknown): boolean {
  return value !== undefined && value !== null && String(value).trim() !== "";
}

export function firstTranslation(
  values: Record<string, unknown>,
  field: string
): string | undefined {
  for (const lang of MULTILANG_LANGUAGES) {
    const value = values[`${field}_${lang}`];
    if (hasText(value)) return String(value);
  }
  return undefined;
}

export function hasAnyTranslation(
  values: Record<string, unknown>,
  field: string
): boolean {
  return firstTranslation(values, field) !== undefined;
}

export function fillMissingTranslations<T extends object>(
  data: T,
  fields: readonly string[]
): T {
  const result: Record<string, unknown> = { ...(data as Record<string, unknown>) };

  fields.forEach((field) => {
    const source = firstTranslation(result, field);
    if (source === undefined) return;

    MULTILANG_LANGUAGES.forEach((lang) => {
      const key = `${field}_${lang}`;
      if (!hasText(result[key])) result[key] = source;
    });
  });

  return result as T;
}

export function withRequiredTranslations<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  fields: readonly { name: string; label: string }[]
) {
  return schema.superRefine((data, ctx) => {
    const values = data as Record<string, unknown>;

    fields.forEach(({ name, label }) => {
      if (hasAnyTranslation(values, name)) return;

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [`${name}_uz`],
        message: `${label} kamida bitta tilda to'ldirilishi kerak`,
      });
    });
  });
}
