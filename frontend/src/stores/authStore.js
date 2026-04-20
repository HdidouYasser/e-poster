import { create } from "zustand";
import { api } from "../api";

const TOKEN_KEY = "eposter_token";
const USER_KEY = "eposter_user";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  username: localStorage.getItem(USER_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  login: async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, data.username);
    set({ token: data.token, username: data.username, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, username: null, isAuthenticated: false });
  }
}));
