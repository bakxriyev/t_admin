import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined, fmt: string = "dd.MM.yyyy"): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return format(d, fmt);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return format(d, "dd.MM.yyyy HH:mm");
}

export function getImageUrl(path?: string | null): string {
  if (!path) return "/placeholder.svg";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}

export function truncate(str: string | null | undefined, length: number = 100): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.substring(0, length) + "...";
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    contacted: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    registered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    answered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}


