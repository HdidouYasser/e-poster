import { create } from "zustand";
import { api } from "../api";

const TOKEN_KEY = "eposter_token";
const USER_KEY = "eposter_user";
const ROLE_KEY = "eposter_role";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  username: localStorage.getItem(USER_KEY),
  role: localStorage.getItem(ROLE_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  login: async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, data.username);
    localStorage.setItem(ROLE_KEY, data.role);
    set({ token: data.token, username: data.username, role: data.role, isAuthenticated: true });
  },
  registerUser: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, data.username);
    localStorage.setItem(ROLE_KEY, data.role);
    set({ token: data.token, username: data.username, role: data.role, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    set({ token: null, username: null, role: null, isAuthenticated: false });
  }
}));
