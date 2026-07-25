import {
  LayoutDashboard,
  Newspaper,
  Users,
  Trophy,
  Building2,
  Briefcase,
  ClipboardList,
  HelpCircle,
  Settings2,
  Activity,
  Info,
  Link2,
  Image,
  BookOpen,
  MessageSquareQuote,
  Video,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard },
  { title: "Yangiliklar", href: "/news", icon: Newspaper },
  { title: "Hero Slaydlar", href: "/hero", icon: Image },
  { title: "Kurslar", href: "/courses-offers", icon: BookOpen },
  { title: "O'qituvchilar", href: "/teachers", icon: Users },
  { title: "Fikrlar", href: "/testimonials", icon: MessageSquareQuote },
  { title: "Video Sharhlar", href: "/video-reviews", icon: Video },
  { title: "Natijalar", href: "/results", icon: Trophy },
  { title: "Statistika", href: "/site-stats", icon: BarChart3 },
  { title: "Jamoa", href: "/team", icon: Building2 },
  { title: "Vakansiyalar", href: "/vacancies", icon: Briefcase },
  { title: "Biz haqimizda", href: "/about", icon: Info },
  { title: "Arizalar", href: "/applications", icon: ClipboardList },
  { title: "Savollar", href: "/questions", icon: HelpCircle },
  { title: "Ijtimoiy tarmoqlar", href: "/social-links", icon: Link2 },
  { title: "Sozlamalar", href: "/settings", icon: Settings2 },
  { title: "Analitika", href: "/analytics", icon: Activity },
];

export const statisticFields = [
  { name: "label", label: "Nomi", type: "multilang" as const, placeholder: "Talabalar / Students" },
  { name: "value", label: "Qiymat (son)", type: "number" as const, placeholder: "1500" },
  { name: "suffix", label: "Qo'shimcha (+, %, x)", type: "text" as const, placeholder: "+" },
  { name: "icon", label: "Ikonka (lucide)", type: "text" as const, placeholder: "Users" },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export const newsTypeOptions = [
  { value: "news", label: "Yangilik" },
  { value: "article", label: "Maqola" },
  { value: "announcement", label: "E'lon" },
];

export const statusOptions = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

export const applicationStatusOptions = [
  { value: "new", label: "Yangi" },
  { value: "contacted", label: "Aloqaga chiqilgan" },
  { value: "registered", label: "Ro'yxatdan o'tgan" },
  { value: "closed", label: "Yopilgan" },
];

export const vacancyTypeOptions = [
  { value: "full_time", label: "To'liq vaqt" },
  { value: "part_time", label: "Yarim vaqt" },
  { value: "internship", label: "Amaliyot" },
];

export const heroFields = [
  { name: "title", label: "Sarlavha", type: "multilang" as const, placeholder: "Asosiy sarlavha" },
  { name: "subtitle", label: "Subtitr (kursiv)", type: "multilang" as const, placeholder: "Subtitr matni" },
  { name: "button_text", label: "Tugma matni", type: "multilang" as const, placeholder: "Ro'yxatdan o'tish" },
  { name: "button_link", label: "Tugma URL", type: "url" as const, placeholder: "https://..." },
  { name: "video_url", label: "Video URL", type: "url" as const, placeholder: "https://youtube.com/..." },
  { name: "image", label: "Rasm", type: "file" as const },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
  { name: "title_font_size", label: "Sarlavha shrifti (masalan: 4.5rem)", type: "text" as const, placeholder: "4.5rem" },
  { name: "subtitle_font_size", label: "Subtitr shrifti (masalan: 1.125rem)", type: "text" as const, placeholder: "1.125rem" },
  { name: "title_font_weight", label: "Sarlavha qalinligi (100-900)", type: "text" as const, placeholder: "700" },
  { name: "subtitle_font_weight", label: "Subtitr qalinligi (100-900)", type: "text" as const, placeholder: "400" },
  { name: "text_align", label: "Matn joylashuvi", type: "select" as const, options: [
    { value: "left", label: "Chapga" },
    { value: "center", label: "O'rtaga" },
    { value: "right", label: "O'ngga" },
  ]},
  { name: "max_width", label: "Maksimal kenglik (masalan: 800px)", type: "text" as const, placeholder: "100%" },
];

export const courseOfferFields = [
  { name: "title", label: "Nomi", type: "multilang" as const, placeholder: "Kurs nomi" },
  { name: "description", label: "Tavsif", type: "multilang-textarea" as const },
  { name: "price", label: "Narx", type: "number" as const, placeholder: "0" },
  { name: "duration", label: "Davomiylik", type: "text" as const, placeholder: "3 oy" },
  { name: "level", label: "Daraja", type: "text" as const, placeholder: "Boshlang'ich" },
  { name: "image", label: "Rasm", type: "file" as const },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export const testimonialFields = [
  { name: "name", label: "Ism", type: "multilang" as const, placeholder: "Ism familiya" },
  { name: "position", label: "Lavozim", type: "multilang" as const, placeholder: "Lavozim" },
  { name: "content", label: "Matn", type: "multilang" as const, placeholder: "Fikr matni" },
  { name: "type", label: "Tur", type: "select" as const, options: [{ value: "text", label: "Matn" }, { value: "video", label: "Video" }] },
  { name: "video_url", label: "Video URL", type: "url" as const, placeholder: "https://youtube.com/..." },
  { name: "image", label: "Rasm", type: "file" as const },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export const videoReviewFields = [
  { name: "name", label: "Ism", type: "multilang" as const, placeholder: "Talaba ismi" },
  { name: "description", label: "Izoh", type: "multilang-textarea" as const, placeholder: "Qisqa izoh" },
  { name: "video", label: "Video fayl", type: "file" as const },
  { name: "order", label: "Tartib", type: "number" as const },
  { name: "is_active", label: "Faol", type: "boolean" as const },
];

export const languageOptions = [
  { value: "uz", label: "O'zbek" },
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];
