import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { JSX } from 'react/jsx-runtime';

export const ProtectedRoute = ({ children, allowedRoles = [] }: {
  children: JSX.Element;
  allowedRoles?: string[]
}) => {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};