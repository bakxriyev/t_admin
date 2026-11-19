import { z } from "zod";
import { withRequiredTranslations } from "./multilang";

const optionalText = z.string().optional();

export const loginSchema = z.object({
  email: z.string().email("Noto'g'ri email format"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export const newsSchema = withRequiredTranslations(
  z.object({
    title_uz: optionalText,
    title_ru: optionalText,
    title_en: optionalText,
    content_uz: optionalText,
    content_ru: optionalText,
    content_en: optionalText,
    excerpt_uz: optionalText,
    excerpt_ru: optionalText,
    excerpt_en: optionalText,
    status: z.enum(["published", "draft"]),
    image: z.any().optional(),
    video_url: z.string().optional(),
  }),
  [
    { name: "title", label: "Sarlavha" },
    { name: "content", label: "Matn" },
  ]
);

export const teacherSchema = withRequiredTranslations(
  z.object({
    first_name_uz: optionalText,
    first_name_ru: optionalText,
    first_name_en: optionalText,
    last_name_uz: optionalText,
    last_name_ru: optionalText,
    last_name_en: optionalText,
    patronymic_uz: optionalText,
    patronymic_ru: optionalText,
    patronymic_en: optionalText,
    position_uz: optionalText,
    position_ru: optionalText,
    position_en: optionalText,
    order: z.number().optional(),
    is_active: z.boolean().optional(),
    photo: z.any().optional(),
  }),
  [
    { name: "first_name", label: "Ism" },
    { name: "last_name", label: "Familiya" },
    { name: "position", label: "Lavozim" },
  ]
);

export const reviewSchema = withRequiredTranslations(
  z.object({
    name_uz: optionalText,
    name_ru: optionalText,
    name_en: optionalText,
    position_uz: optionalText,
    position_ru: optionalText,
    position_en: optionalText,
    content_uz: optionalText,
    content_ru: optionalText,
    content_en: optionalText,
    rating: z.number().min(1).max(5),
    photo: z.any().optional(),
    is_active: z.boolean().optional(),
  }),
  [
    { name: "name", label: "Ism" },
    { name: "position", label: "Lavozim" },
    { name: "content", label: "Matn" },
  ]
);

export const resultSchema = withRequiredTranslations(
  z.object({
    student_name_uz: optionalText,
    student_name_ru: optionalText,
    student_name_en: optionalText,
    achievement_uz: optionalText,
    achievement_ru: optionalText,
    achievement_en: optionalText,
    description_uz: optionalText,
    description_ru: optionalText,
    description_en: optionalText,
    year: z.number().min(1900).max(2100),
    photos: z.array(z.any()).optional(),
    is_active: z.boolean().optional(),
  }),
  [
    { name: "student_name", label: "Talaba ismi" },
    { name: "achievement", label: "Yutuq" },
  ]
);

export const teamMemberSchema = withRequiredTranslations(
  z.object({
    first_name_uz: optionalText,
    first_name_ru: optionalText,
    first_name_en: optionalText,
    last_name_uz: optionalText,
    last_name_ru: optionalText,
    last_name_en: optionalText,
    position_uz: optionalText,
    position_ru: optionalText,
    position_en: optionalText,
    photo: z.any().optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
  }),
  [
    { name: "first_name", label: "Ism" },
    { name: "last_name", label: "Familiya" },
    { name: "position", label: "Lavozim" },
  ]
);

export const vacancySchema = withRequiredTranslations(
  z.object({
    title_uz: optionalText,
    title_ru: optionalText,
    title_en: optionalText,
    description_uz: optionalText,
    description_ru: optionalText,
    description_en: optionalText,
    requirements_uz: optionalText,
    requirements_ru: optionalText,
    requirements_en: optionalText,
    salary: z.string().optional(),
    type: z.enum(["full_time", "part_time", "internship"]),
    is_active: z.boolean().optional(),
  }),
  [
    { name: "title", label: "Sarlavha" },
    { name: "description", label: "Tavsif" },
  ]
);

export const settingsSchema = z.object({
  site_name_uz: z.string().min(1, "Sayt nomi (UZ) majburiy"),
  site_name_ru: z.string().min(1, "Название сайта (RU) обязательно"),
  site_name_en: z.string().min(1, "Site name (EN) is required"),
  email: z.string().email(),
  phone: z.string().min(1, "Telefon majburiy"),
  address_uz: z.string().min(1, "Manzil (UZ) majburiy"),
  address_ru: z.string().min(1, "Адрес (RU) обязателен"),
  address_en: z.string().min(1, "Address (EN) is required"),
  working_hours_uz: z.string().optional(),
  working_hours_ru: z.string().optional(),
  working_hours_en: z.string().optional(),
  logo: z.any().optional(),
  favicon: z.any().optional(),
});

export const heroSchema = withRequiredTranslations(
  z.object({
    title_uz: optionalText,
    title_ru: optionalText,
    title_en: optionalText,
    subtitle_uz: optionalText,
    subtitle_ru: optionalText,
    subtitle_en: optionalText,
    button_text_uz: optionalText,
    button_text_ru: optionalText,
    button_text_en: optionalText,
    button_link: z.string().url("Noto'g'ri URL format").optional().or(z.literal("")),
    video_url: z.string().url("Noto'g'ri URL format").optional().or(z.literal("")),
    image: z.any().optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
    title_font_size: z.string().optional(),
    subtitle_font_size: z.string().optional(),
    title_font_weight: z.string().optional(),
    subtitle_font_weight: z.string().optional(),
    text_align: z.string().optional(),
    max_width: z.string().optional(),
  }),
  [{ name: "title", label: "Sarlavha" }]
);

export const statisticSchema = withRequiredTranslations(
  z.object({
    label_uz: optionalText,
    label_ru: optionalText,
    label_en: optionalText,
    value: z.number().min(0),
    suffix: z.string().optional(),
    icon: z.string().optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
  }),
  [{ name: "label", label: "Nomi" }]
);

export const courseOfferSchema = withRequiredTranslations(
  z.object({
    title_uz: optionalText,
    title_ru: optionalText,
    title_en: optionalText,
    description_uz: optionalText,
    description_ru: optionalText,
    description_en: optionalText,
    price: z.number().min(0, "Narx 0 dan kichik bo'lmasligi kerak"),
    duration: z.string().optional(),
    level: z.string().optional(),
    image: z.any().optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
  }),
  [
    { name: "title", label: "Nomi" },
    { name: "description", label: "Tavsif" },
  ]
);

export const testimonialSchema = withRequiredTranslations(
  z.object({
    name_uz: optionalText,
    name_ru: optionalText,
    name_en: optionalText,
    position_uz: optionalText,
    position_ru: optionalText,
    position_en: optionalText,
    content_uz: optionalText,
    content_ru: optionalText,
    content_en: optionalText,
    type: z.enum(["text", "video"]),
    video_url: z.string().url("Noto'g'ri URL").optional().or(z.literal("")),
    image: z.any().optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
  }),
  [{ name: "name", label: "Ism" }]
);

export const videoReviewSchema = withRequiredTranslations(
  z.object({
    name_uz: optionalText,
    name_ru: optionalText,
    name_en: optionalText,
    description_uz: optionalText,
    description_ru: optionalText,
    description_en: optionalText,
    video: z.any().optional(),
    order: z.number().optional(),
    is_active: z.boolean().optional(),
  }),
  [{ name: "name", label: "Ism" }]
);

export type LoginFormData = z.infer<typeof loginSchema>;
export type NewsFormData = z.infer<typeof newsSchema>;
export type TeacherFormData = z.infer<typeof teacherSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ResultFormData = z.infer<typeof resultSchema>;
export type TeamMemberFormData = z.infer<typeof teamMemberSchema>;
export type VacancyFormData = z.infer<typeof vacancySchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
export type HeroFormData = z.infer<typeof heroSchema>;
export type StatisticFormData = z.infer<typeof statisticSchema>;
export type CourseOfferFormData = z.infer<typeof courseOfferSchema>;
export type TestimonialFormData = z.infer<typeof testimonialSchema>;
export type VideoReviewFormData = z.infer<typeof videoReviewSchema>;
