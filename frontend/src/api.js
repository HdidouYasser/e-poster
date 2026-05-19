import axios from "axios";
import { useAuthStore } from "./stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

/**
 * Public Axios instance for the Totem (no auth interceptors).
 * Use this in all Totem components to avoid triggering logout()
 * on public endpoints that don't require a JWT.
 */
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api"
});
