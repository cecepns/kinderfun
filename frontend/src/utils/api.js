import axios from "axios";

export const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  baseURL: import.meta.env.VITE_API_URL || "https://api.kingcreativestudio.my.id/kinderfun/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("kinderfun_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to format image URLs properly across environment (local & production)
export const getImageUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  const apiBase = api.defaults.baseURL; // e.g. "https://api.kingcreativestudio.my.id/kinderfun/api" or "http://localhost:5000/api"
  const domainBase = apiBase.replace(/\/api\/?$/, "");
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${domainBase}${cleanPath}`;
};

