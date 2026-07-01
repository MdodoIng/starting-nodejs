import Cookies from 'js-cookie';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

export const TOKEN_KEY = 'shopnest_token';

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY);
}

export function setToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 7 }); // 7 days
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY);
}

export function getUser(): JwtPayload | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  return !!getUser();
}

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}