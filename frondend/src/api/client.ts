/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

let authToken: string | null = localStorage.getItem("marquee_token");

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem("marquee_token", token);
  else localStorage.removeItem("marquee_token");
}

export function getAuthToken() {
  return authToken;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.error || `Request failed (${res.status})`,
      data?.details,
    );
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
