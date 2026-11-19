import { Globe } from "lucide-react";

export const languages = [
  { value: "uz", label: "O'zbek", flag: "UZ" },
  { value: "ru", label: "Русский", flag: "RU" },
  { value: "en", label: "English", flag: "EN" },
];

export type Lang = "uz" | "ru" | "en";

type Translations = Record<string, Record<Lang, string>>;

export const translations: Translations = {
  // Navbar
  "search.placeholder": { uz: "Qidirish...", ru: "Поиск...", en: "Search..." },
  "nav.dashboard": { uz: "Dashboard", ru: "Дашборд", en: "Dashboard" },
  "nav.news": { uz: "Yangiliklar", ru: "Новости", en: "News" },
  "nav.hero": { uz: "Hero Slaydlar", ru: "Hero Слайды", en: "Hero Slides" },
  "nav.courses": { uz: "Kurslar", ru: "Курсы", en: "Courses" },
  "nav.coursesoffers": { uz: "Kurslar", ru: "Курсы", en: "Course Offers" },
  "nav.sociallinks": { uz: "Ijtimoiy tarmoqlar", ru: "Соцсети", en: "Social Links" },
  "nav.teachers": { uz: "O'qituvchilar", ru: "Преподаватели", en: "Teachers" },
  "nav.testimonials": { uz: "Fikrlar", ru: "Отзывы", en: "Testimonials" },
  "nav.videoreviews": { uz: "Video Sharhlar", ru: "Видео отзывы", en: "Video Reviews" },
  "nav.results": { uz: "Natijalar", ru: "Результаты", en: "Results" },
  "nav.sitestats": { uz: "Sayt statistikasi", ru: "Статистика сайта", en: "Site stats" },
  "nav.team": { uz: "Jamoa", ru: "Команда", en: "Team" },
  "nav.vacancies": { uz: "Vakansiyalar", ru: "Вакансии", en: "Vacancies" },
  "nav.about": { uz: "Biz haqimizda", ru: "О нас", en: "About" },
  "nav.applications": { uz: "Arizalar", ru: "Заявки", en: "Applications" },
  "nav.questions": { uz: "Savollar", ru: "Вопросы", en: "Questions" },
  "nav.faq": { uz: "Savol-javoblar (FAQ)", ru: "Вопросы и ответы (FAQ)", en: "FAQ" },
  "nav.social": { uz: "Ijtimoiy tarmoqlar", ru: "Соцсети", en: "Social Links" },
  "nav.settings": { uz: "Sozlamalar", ru: "Настройки", en: "Settings" },
  "nav.analytics": { uz: "Analitika", ru: "Аналитика", en: "Analytics" },
  "nav.logout": { uz: "Chiqish", ru: "Выход", en: "Logout" },
  "nav.admin": { uz: "Admin", ru: "Админ", en: "Admin" },

  // DataTable
  "table.search": { uz: "Qidirish...", ru: "Поиск...", en: "Search..." },
  "table.noData": { uz: "Ma'lumot topilmadi", ru: "Данные не найдены", en: "No data found" },
  "table.records": { uz: "ta yozuv", ru: "записей", en: "records" },

  // Actions
  "action.add": { uz: "Yangi qo'shish", ru: "Добавить", en: "Add New" },
  "action.edit": { uz: "Tahrirlash", ru: "Редактировать", en: "Edit" },
  "action.delete": { uz: "O'chirish", ru: "Удалить", en: "Delete" },
  "action.save": { uz: "Saqlash", ru: "Сохранить", en: "Save" },
  "action.cancel": { uz: "Bekor qilish", ru: "Отмена", en: "Cancel" },
  "action.saving": { uz: "Saqlanmoqda...", ru: "Сохранение...", en: "Saving..." },

  // Status
  "status.active": { uz: "Faol", ru: "Активный", en: "Active" },
  "status.inactive": { uz: "No faol", ru: "Неактивный", en: "Inactive" },
  "status.published": { uz: "Nashr qilingan", ru: "Опубликовано", en: "Published" },
  "status.draft": { uz: "Qoralama", ru: "Черновик", en: "Draft" },

  // Notifications
  "notif.added": { uz: "Qo'shildi", ru: "Добавлено", en: "Added" },
  "notif.updated": { uz: "Yangilandi", ru: "Обновлено", en: "Updated" },
  "notif.deleted": { uz: "O'chirildi", ru: "Удалено", en: "Deleted" },
  "notif.error": { uz: "Xatolik yuz berdi", ru: "Произошла ошибка", en: "An error occurred" },
  "notif.loadError": { uz: "Ma'lumotlarni yuklashda xatolik", ru: "Ошибка загрузки данных", en: "Error loading data" },
  "notif.deleteError": { uz: "O'chirishda xatolik", ru: "Ошибка удаления", en: "Error deleting" },

  // Confirm
  "confirm.delete": { uz: "O'chirish", ru: "Удалить", en: "Delete" },
  "confirm.deleteMessage": { uz: "Bu ma'lumotni o'chirmoqchimisiz?", ru: "Вы хотите удалить эти данные?", en: "Are you sure you want to delete this?" },

  // Login
  "login.title": { uz: "Tashkent Law School", ru: "Tashkent Law School", en: "Tashkent Law School" },
  "login.subtitle": { uz: "Admin panelga kirish", ru: "Вход в админ-панель", en: "Admin panel login" },
  "login.email": { uz: "Email", ru: "Email", en: "Email" },
  "login.password": { uz: "Parol", ru: "Пароль", en: "Password" },
  "login.button": { uz: "Kirish", ru: "Войти", en: "Sign In" },
  "login.loading": { uz: "Kirilmoqda...", ru: "Вход...", en: "Signing in..." },
  "login.success": { uz: "Tizimga muvaffaqiyatli kirdingiz", ru: "Успешный вход", en: "Successfully logged in" },
  "login.error": { uz: "Login yoki parol noto'g'ri", ru: "Неверный логин или пароль", en: "Invalid email or password" },

  // Page titles
  "page.dashboard": { uz: "Dashboard", ru: "Дашборд", en: "Dashboard" },
  "page.dashboard.desc": { uz: "Tizimdagi umumiy ma'lumotlar", ru: "Общая информация системы", en: "System overview" },
  "page.news": { uz: "Yangiliklar", ru: "Новости", en: "News" },
  "page.news.desc": { uz: "Barcha yangiliklar, maqolalar va e'lonlar", ru: "Все новости, статьи и объявления", en: "All news, articles and announcements" },
  "page.hero": { uz: "Hero Slaydlar", ru: "Hero Слайды", en: "Hero Slides" },
  "page.hero.desc": { uz: "Barcha hero slaydlar ro'yxati", ru: "Список всех hero слайдов", en: "All hero slides" },
  "page.courses": { uz: "Kurslar", ru: "Курсы", en: "Courses" },
  "page.courses.desc": { uz: "Barcha kurslar ro'yxati", ru: "Список всех курсов", en: "All courses" },
  "page.coursesoffers": { uz: "Kurslar", ru: "Курсы", en: "Course Offers" },
  "page.coursesoffers.desc": { uz: "Barcha kurs takliflari", ru: "Все предложения курсов", en: "All course offers" },
  "page.sociallinks": { uz: "Ijtimoiy tarmoqlar", ru: "Соцсети", en: "Social Links" },
  "page.sociallinks.desc": { uz: "Ijtimoiy tarmoq havolalari", ru: "Ссылки на соцсети", en: "Social media links" },
  "page.teachers": { uz: "O'qituvchilar", ru: "Преподаватели", en: "Teachers" },
  "page.teachers.desc": { uz: "Barcha o'qituvchilar ro'yxati", ru: "Список всех преподавателей", en: "All teachers" },
  "page.testimonials": { uz: "O'quvchilar Fikrlari", ru: "Отзывы студентов", en: "Testimonials" },
  "page.testimonials.desc": { uz: "Barcha fikr va video tavsiyalar", ru: "Все отзывы и видео-рекомендации", en: "All testimonials and video reviews" },
  "page.videoreviews": { uz: "Video Sharhlar", ru: "Видео отзывы", en: "Video Reviews" },
  "page.videoreviews.desc": { uz: "Talabalar video sharhlari", ru: "Видео отзывы студентов", en: "Student video reviews" },
  "page.applications": { uz: "Arizalar", ru: "Заявки", en: "Applications" },
  "page.applications.desc": { uz: "Barcha arizalar ro'yxati", ru: "Список заявок", en: "All applications" },
  "page.questions": { uz: "Savollar", ru: "Вопросы", en: "Questions" },
  "page.questions.desc": { uz: "Barcha savollar ro'yxati", ru: "Список вопросов", en: "All questions" },

  // Common field labels
  "field.image": { uz: "Rasm", ru: "Изображение", en: "Image" },
  "field.order": { uz: "Tartib", ru: "Порядок", en: "Order" },
  "field.status": { uz: "Holat", ru: "Статус", en: "Status" },
  "field.type": { uz: "Turi", ru: "Тип", en: "Type" },
  "field.name": { uz: "Ism", ru: "Имя", en: "Name" },
  "field.title": { uz: "Sarlavha", ru: "Заголовок", en: "Title" },
  "field.description": { uz: "Tavsif", ru: "Описание", en: "Description" },
  "field.actions": { uz: "Amallar", ru: "Действия", en: "Actions" },
  "field.link": { uz: "URL", ru: "URL", en: "URL" },
  "field.price": { uz: "Narxi", ru: "Цена", en: "Price" },
  "field.duration": { uz: "Davomiyligi", ru: "Длительность", en: "Duration" },
  "field.level": { uz: "Daraja", ru: "Уровень", en: "Level" },
  "field.views": { uz: "Ko'rishlar", ru: "Просмотры", en: "Views" },
  "field.date": { uz: "Sana", ru: "Дата", en: "Date" },
  "field.phone": { uz: "Telefon", ru: "Телефон", en: "Phone" },
  "field.email": { uz: "Email", ru: "Email", en: "Email" },
  "field.position": { uz: "Lavozim", ru: "Должность", en: "Position" },
};

export function t(key: string, lang: Lang): string {
  return translations[key]?.[lang] || translations[key]?.["uz"] || key;
}
