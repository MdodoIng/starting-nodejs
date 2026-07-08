import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./Spinner";
import type React from "react";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}
