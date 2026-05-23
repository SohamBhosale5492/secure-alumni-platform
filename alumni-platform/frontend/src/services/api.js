import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
export const SERVER_URL = API_URL.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("secureAlumniToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function assetUrl(path) {
  if (!path) {
    return "";
  }

  if (path.startsWith("http")) {
    return path;
  }

  return `${SERVER_URL}${path}`;
}

export default api;
