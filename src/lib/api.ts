import axios from "axios";
import { signOut } from "next-auth/react";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://b.tashkentlawschool.uz";

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRedirecting = false;

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * The backend (Sequelize) returns camelCase timestamps (createdAt / updatedAt),
 * while the admin pages read created_at / updated_at. Add snake_case aliases so
 * dates and "newest first" sorting work everywhere.
 */
function aliasTimestamps(value: unknown, depth = 0): void {
  if (!value || typeof value !== "object" || depth > 5) return;
  if (Array.isArray(value)) {
    value.forEach((v) => aliasTimestamps(v, depth + 1));
    return;
  }
  const obj = value as Record<string, unknown>;
  if (obj.createdAt !== undefined && obj.created_at === undefined) obj.created_at = obj.createdAt;
  if (obj.updatedAt !== undefined && obj.updated_at === undefined) obj.updated_at = obj.updatedAt;
  for (const v of Object.values(obj)) if (v && typeof v === "object") aliasTimestamps(v, depth + 1);
}

api.interceptors.response.use(
  (response) => {
    aliasTimestamps(response.data);
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined" && !isRedirecting) {
      isRedirecting = true;
      localStorage.removeItem("token");
      localStorage.removeItem("admin");
      await signOut({ redirect: false }).catch(() => {});
      window.location.href = "/login?expired=1";
    }
    return Promise.reject(error);
  }
);

export default api;
