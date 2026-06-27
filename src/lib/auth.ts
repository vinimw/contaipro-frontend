import type { User } from "@/types/user";

const ACCESS_TOKEN_KEY = "contai-pro.access-token";
const USER_KEY = "contai-pro.user";

function isBrowser() {
  return typeof window !== "undefined";
}

function notifyAuthChange() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event("auth:changed"));
}

export function getAccessToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  notifyAuthChange();
}

export function clearAccessToken() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  notifyAuthChange();
}

export function getStoredUser() {
  if (!isBrowser()) {
    return null;
  }

  const stored = window.localStorage.getItem(USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setStoredUser(user: User) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChange();
}

export function clearStoredUser() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}

export function clearSession() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  notifyAuthChange();
}
