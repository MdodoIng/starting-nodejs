// Small shared client for talking to the leaderboard backend from the browser.
// Token is kept in localStorage since this is a real deployed site (not the
// sandboxed artifact preview), so browser storage APIs work normally here.

const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
const TOKEN_KEY = "leaderboard_token";
const USER_KEY = "leaderboard_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/**
 * Fetch wrapper that adds the JSON content-type, the bearer token (if present),
 * and throws a readable Error on non-2xx responses.
 */

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

export { API_URL };
