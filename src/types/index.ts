export type Role = "admin" | "user";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  created_at: string;
}
export interface AuthPayload {
  id: number;
  email: string;
  role: Role;
}

// Extend Express Request with the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
