import axios from "axios";
import { signOut } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
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

api.interceptors.response.use(
  (response) => response,
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
