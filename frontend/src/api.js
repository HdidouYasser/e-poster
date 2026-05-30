import axios from "axios";
import { useAuthStore } from "./stores/authStore";

export const getMediaUrl = (path) => {
  if (!path) return "";
  const cleanPath = path.trim();
  // Check if it's already an absolute URL referencing the local backend port 8080
  if (cleanPath.startsWith("http://localhost:8080")) {
    return cleanPath.replace("http://localhost:8080", window.location.origin);
  }
  // If it is a relative API files path, make it absolute under current origin
  if (cleanPath.startsWith("/api/")) {
    return window.location.origin + cleanPath;
  }
  if (cleanPath.startsWith("uploads/") || cleanPath.startsWith("files/")) {
    return window.location.origin + "/api/" + cleanPath;
  }
  // Otherwise, if it starts with a relative slash, prepend origin
  if (cleanPath.startsWith("/")) {
    return window.location.origin + cleanPath;
  }
  return cleanPath;
};

export const getPosterThumbnail = (posterUrl) => {
  if (!posterUrl) return "";
  const url = getMediaUrl(posterUrl);
  if (url.toLowerCase().endsWith(".pdf")) {
    const parts = url.split("/api/files/");
    if (parts.length === 2) {
      return parts[0] + "/api/files/thumb_" + parts[1].replace(/\.pdf$/i, ".jpg");
    }
  }
  return url;
};


export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api"
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
  baseURL: import.meta.env.VITE_API_URL || "/api"
});

