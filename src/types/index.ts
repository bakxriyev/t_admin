export interface Admin {
  id: number;
  full_name: string;
  email: string;
  role: string;
  avatar?: string;
  created_at: string;
}

export interface Seo {
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  keywords_uz: string;
  keywords_ru: string;
  keywords_en: string;
}

export interface SocialLink {
  id: number;
  platform: string;
  url: string;
  icon?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: number;
  site_name_uz: string;
  site_name_ru: string;
  site_name_en: string;
  logo?: string;
  favicon?: string;
  email: string;
  phone: string;
  address_uz: string;
  address_ru: string;
  address_en: string;
  working_hours_uz: string;
  working_hours_ru: string;
  working_hours_en: string;
  seo: Seo;
  social_links: SocialLink[];
  created_at: string;
  updated_at: string;
}

export interface News {
  id: number;
  title_uz: string;
  title_ru: string;
  title_en: string;
  content_uz: string;
  content_ru: string;
  content_en: string;
  slug: string;
  excerpt_uz: string;
  excerpt_ru: string;
  excerpt_en: string;
  image?: string;
  video_url?: string;
  type: 'news' | 'article' | 'announcement';
  status: 'published' | 'draft';
  views: number;
  created_at: string;
  updated_at: string;
}

export interface About {
  id: number;
  content_uz: string;
  content_ru: string;
  content_en: string;
  mission_uz: string;
  mission_ru: string;
  mission_en: string;
  vision_uz: string;
  vision_ru: string;
  vision_en: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export interface Teacher {
  id: number;
  first_name_uz: string;
  first_name_ru: string;
  first_name_en: string;
  last_name_uz: string;
  last_name_ru: string;
  last_name_en: string;
  patronymic_uz?: string;
  patronymic_ru?: string;
  patronymic_en?: string;
  position_uz: string;
  position_ru: string;
  position_en: string;
  bio_uz: string;
  bio_ru: string;
  bio_en: string;
  degree_uz: string;
  degree_ru: string;
  degree_en: string;
  photo?: string;
  email?: string;
  phone?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Result {
  id: number;
  student_name_uz: string;
  student_name_ru: string;
  student_name_en: string;
  achievement_uz: string;
  achievement_ru: string;
  achievement_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  year: number;
  photo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  position_uz: string;
  position_ru: string;
  position_en: string;
  content_uz: string;
  content_ru: string;
  content_en: string;
  rating: number;
  photo?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  first_name_uz: string;
  first_name_ru: string;
  first_name_en: string;
  last_name_uz: string;
  last_name_ru: string;
  last_name_en: string;
  position_uz: string;
  position_ru: string;
  position_en: string;
  bio_uz: string;
  bio_ru: string;
  bio_en: string;
  photo?: string;
  email?: string;
  phone?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vacancy {
  id: number;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  requirements_uz: string;
  requirements_ru: string;
  requirements_en: string;
  salary?: string;
  type: 'full_time' | 'part_time' | 'internship';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseApplication {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  course_name: string;
  status: 'new' | 'contacted' | 'registered' | 'closed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface QuickQuestion {
  id: number;
  full_name: string;
  phone: string;
  question: string;
  answer?: string;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
}

export interface Statistic {
  id: number;
  label_uz: string;
  label_ru: string;
  label_en: string;
  value: number;
  icon?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Hero {
  id: number;
  title_uz: string;
  title_ru: string;
  title_en: string;
  subtitle_uz: string;
  subtitle_ru: string;
  subtitle_en: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  button_text_uz?: string;
  button_text_ru?: string;
  button_text_en?: string;
  button_link?: string;
  video_url?: string;
  image?: string;
  order: number;
  is_active: boolean;
  title_font_size?: string;
  subtitle_font_size?: string;
  description_font_size?: string;
  title_font_weight?: string;
  subtitle_font_weight?: string;
  description_font_weight?: string;
  text_align?: string;
  max_width?: string;
  created_at: string;
  updated_at: string;
}

export interface CourseOffer {
  id: number;
  title_uz: string;
  title_ru: string;
  title_en: string;
  description_uz: string;
  description_ru: string;
  description_en: string;
  price: number;
  duration?: string;
  level?: string;
  image?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  position_uz?: string;
  position_ru?: string;
  position_en?: string;
  content_uz?: string;
  content_ru?: string;
  content_en?: string;
  video_url?: string;
  image?: string;
  type: 'text' | 'video';
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface VideoReview {
  id: number;
  name_uz: string;
  name_ru: string;
  name_en: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  video?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteAnalytic {
  id: number;
  page_url: string;
  visitors: number;
  unique_visitors: number;
  date: string;
  created_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Visit {
  id: number;
  page: string;
  ip_address?: string;
  user_agent?: string;
  country?: string;
  region?: string;
  city?: string;
  latitude?: string;
  longitude?: string;
  referrer?: string;
  visited_at: string;
}

export interface RegionStat {
  region: string;
  city: string;
  count: number;
  unique: number;
}

export interface VisitStats {
  totalVisits: number;
  uniqueIps: number;
  totalPages: number;
  todayVisits: number;
  pageViews: { page: string; views: number }[];
  dailyStats: { date: string; count: number; unique: number }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    admin: Admin;
  };
  message: string;
}
