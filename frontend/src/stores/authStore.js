import { create } from "zustand";
import { api } from "../api";

const TOKEN_KEY    = "eposter_token";
const USER_KEY     = "eposter_user";
const ROLE_KEY     = "eposter_role";
const PROFILE_KEY  = "eposter_profile";

function loadProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); }
  catch { return {}; }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export const useAuthStore = create((set, get) => ({
  token:           localStorage.getItem(TOKEN_KEY),
  username:        localStorage.getItem(USER_KEY),
  role:            localStorage.getItem(ROLE_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),

  // Extended profile fields
  firstName:  loadProfile().firstName  || null,
  lastName:   loadProfile().lastName   || null,
  avatarUrl:  loadProfile().avatarUrl  || null,

  // ── Classic login ───────────────────────────────────────────────────────────
  login: async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY,  data.username);
    localStorage.setItem(ROLE_KEY,  data.role);
    const profile = { firstName: data.firstName, lastName: data.lastName, avatarUrl: data.avatarUrl };
    saveProfile(profile);
    set({
      token: data.token, username: data.username, role: data.role,
      isAuthenticated: true, ...profile
    });
  },

  // ── Google OAuth2 login ─────────────────────────────────────────────────────
  loginWithGoogle: async (credential) => {
    const { data } = await api.post("/auth/google", { credential });
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY,  data.username);
    localStorage.setItem(ROLE_KEY,  data.role);
    const profile = { firstName: data.firstName, lastName: data.lastName, avatarUrl: data.avatarUrl };
    saveProfile(profile);
    set({
      token: data.token, username: data.username, role: data.role,
      isAuthenticated: true, ...profile
    });
  },

  // ── Register ────────────────────────────────────────────────────────────────
  registerUser: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY,  data.username);
    localStorage.setItem(ROLE_KEY,  data.role);
    const profile = { firstName: data.firstName, lastName: data.lastName, avatarUrl: data.avatarUrl };
    saveProfile(profile);
    set({
      token: data.token, username: data.username, role: data.role,
      isAuthenticated: true, ...profile
    });
  },

  // ── Load profile from server ────────────────────────────────────────────────
  loadProfile: async () => {
    try {
      const { data } = await api.get("/users/me");
      const profile = { firstName: data.firstName, lastName: data.lastName, avatarUrl: data.avatarUrl };
      saveProfile(profile);
      set(profile);
    } catch { /* ignore — token may not be ready yet */ }
  },

  // ── Update profile ──────────────────────────────────────────────────────────
  updateProfile: async (body) => {
    const { data } = await api.put("/users/me", body);
    const profile = { firstName: data.firstName, lastName: data.lastName, avatarUrl: data.avatarUrl };
    saveProfile(profile);
    set(profile);
    return data;
  },

  // ── Logout ──────────────────────────────────────────────────────────────────
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(PROFILE_KEY);
    set({ token: null, username: null, role: null, isAuthenticated: false,
          firstName: null, lastName: null, avatarUrl: null });
  },
}));
