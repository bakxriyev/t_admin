import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Noto'g'ri email format"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export const newsSchema = z.object({
  title_uz: z.string().min(1, "Sarlavha (UZ) majburiy"),
  title_ru: z.string().min(1, "Заголовок (RU) обязателен"),
  title_en: z.string().min(1, "Title (EN) is required"),
  content_uz: z.string().min(1, "Matn (UZ) majburiy"),
  content_ru: z.string().min(1, "Текст (RU) обязателен"),
  content_en: z.string().min(1, "Content (EN) is required"),
  excerpt_uz: z.string().optional(),
  excerpt_ru: z.string().optional(),
  excerpt_en: z.string().optional(),
  status: z.enum(["published", "draft"]),
  image: z.any().optional(),
  video_url: z.string().optional(),
});

export const teacherSchema = z.object({
  first_name_uz: z.string().min(1, "Ism (UZ) majburiy"),
  first_name_ru: z.string().min(1, "Имя (RU) обязательно"),
  first_name_en: z.string().min(1, "First name (EN) is required"),
  last_name_uz: z.string().min(1, "Familiya (UZ) majburiy"),
  last_name_ru: z.string().min(1, "Фамилия (RU) обязательна"),
  last_name_en: z.string().min(1, "Last name (EN) is required"),
  patronymic_uz: z.string().optional(),
  patronymic_ru: z.string().optional(),
  patronymic_en: z.string().optional(),
  position_uz: z.string().min(1, "Lavozim (UZ) majburiy"),
  position_ru: z.string().min(1, "Должность (RU) обязательна"),
  position_en: z.string().min(1, "Position (EN) is required"),
  bio_uz: z.string().optional(),
  bio_ru: z.string().optional(),
  bio_en: z.string().optional(),
  degree_uz: z.string().optional(),
  degree_ru: z.string().optional(),
  degree_en: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
  photo: z.any().optional(),
});

export const reviewSchema = z.object({
  name_uz: z.string().min(1, "Ism (UZ) majburiy"),
  name_ru: z.string().min(1, "Имя (RU) обязательно"),
  name_en: z.string().min(1, "Name (EN) is required"),
  position_uz: z.string().min(1, "Lavozim (UZ) majburiy"),
  position_ru: z.string().min(1, "Должность (RU) обязательна"),
  position_en: z.string().min(1, "Position (EN) is required"),
  content_uz: z.string().min(1, "Matn (UZ) majburiy"),
  content_ru: z.string().min(1, "Текст (RU) обязателен"),
  content_en: z.string().min(1, "Content (EN) is required"),
  rating: z.number().min(1).max(5),
  photo: z.any().optional(),
  is_active: z.boolean().optional(),
});

export const resultSchema = z.object({
  student_name_uz: z.string().min(1, "Ism (UZ) majburiy"),
  student_name_ru: z.string().min(1, "Имя (RU) обязательно"),
  student_name_en: z.string().min(1, "Name (EN) is required"),
  achievement_uz: z.string().min(1, "Yutuq (UZ) majburiy"),
  achievement_ru: z.string().min(1, "Достижение (RU) обязательна"),
  achievement_en: z.string().min(1, "Achievement (EN) is required"),
  description_uz: z.string().optional(),
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
  year: z.number().min(1900).max(2100),
  photos: z.array(z.any()).optional(),
  is_active: z.boolean().optional(),
});

export const teamMemberSchema = z.object({
  first_name_uz: z.string().min(1, "Ism (UZ) majburiy"),
  first_name_ru: z.string().min(1, "Имя (RU) обязательно"),
  first_name_en: z.string().min(1, "First name (EN) is required"),
  last_name_uz: z.string().min(1, "Familiya (UZ) majburiy"),
  last_name_ru: z.string().min(1, "Фамилия (RU) обязательна"),
  last_name_en: z.string().min(1, "Last name (EN) is required"),
  position_uz: z.string().min(1, "Lavozim (UZ) majburiy"),
  position_ru: z.string().min(1, "Должность (RU) обязательна"),
  position_en: z.string().min(1, "Position (EN) is required"),
  bio_uz: z.string().optional(),
  bio_ru: z.string().optional(),
  bio_en: z.string().optional(),
  photo: z.any().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const vacancySchema = z.object({
  title_uz: z.string().min(1, "Sarlavha (UZ) majburiy"),
  title_ru: z.string().min(1, "Название (RU) обязательно"),
  title_en: z.string().min(1, "Title (EN) is required"),
  description_uz: z.string().min(1, "Tavsif (UZ) majburiy"),
  description_ru: z.string().min(1, "Описание (RU) обязательно"),
  description_en: z.string().min(1, "Description (EN) is required"),
  requirements_uz: z.string().optional(),
  requirements_ru: z.string().optional(),
  requirements_en: z.string().optional(),
  salary: z.string().optional(),
  type: z.enum(["full_time", "part_time", "internship"]),
  is_active: z.boolean().optional(),
});

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

export const heroSchema = z.object({
  title_uz: z.string().min(1, "Sarlavha (UZ) majburiy"),
  title_ru: z.string().min(1, "Заголовок (RU) обязателен"),
  title_en: z.string().min(1, "Title (EN) is required"),
  subtitle_uz: z.string().optional(),
  subtitle_ru: z.string().optional(),
  subtitle_en: z.string().optional(),
  button_text_uz: z.string().optional(),
  button_text_ru: z.string().optional(),
  button_text_en: z.string().optional(),
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
});

export const statisticSchema = z.object({
  label_uz: z.string().min(1, "Label (UZ) majburiy"),
  label_ru: z.string().min(1, "Label (RU) обязателен"),
  label_en: z.string().min(1, "Label (EN) is required"),
  value: z.number().min(0),
  suffix: z.string().optional(),
  icon: z.string().optional(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const courseOfferSchema = z.object({
  title_uz: z.string().min(1, "Sarlavha (UZ) majburiy"),
  title_ru: z.string().min(1, "Название (RU) обязательно"),
  title_en: z.string().min(1, "Title (EN) is required"),
  description_uz: z.string().min(1, "Tavsif (UZ) majburiy"),
  description_ru: z.string().min(1, "Описание (RU) обязательно"),
  description_en: z.string().min(1, "Description (EN) is required"),
  price: z.number().min(0, "Narx 0 dan kichik bo'lmasligi kerak"),
  duration: z.string().optional(),
  level: z.string().optional(),
  image: z.any().optional(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const testimonialSchema = z.object({
  name_uz: z.string().min(1, "Ism (UZ) majburiy"),
  name_ru: z.string().min(1, "Имя (RU) обязательно"),
  name_en: z.string().min(1, "Name (EN) is required"),
  position_uz: z.string().optional(),
  position_ru: z.string().optional(),
  position_en: z.string().optional(),
  content_uz: z.string().optional(),
  content_ru: z.string().optional(),
  content_en: z.string().optional(),
  type: z.enum(["text", "video"]),
  video_url: z.string().url("Noto'g'ri URL").optional().or(z.literal("")),
  image: z.any().optional(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

export const videoReviewSchema = z.object({
  name_uz: z.string().min(1, "Ism (UZ) majburiy"),
  name_ru: z.string().min(1, "Имя (RU) обязательно"),
  name_en: z.string().min(1, "Name (EN) is required"),
  description_uz: z.string().optional(),
  description_ru: z.string().optional(),
  description_en: z.string().optional(),
  video: z.any().optional(),
  order: z.number().optional(),
  is_active: z.boolean().optional(),
});

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
