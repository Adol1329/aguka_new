import { ReactNode } from "react";
import { Navigate, useRouterState } from "@tanstack/react-router";
import { useAuth, type Role } from "@/lib/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  roles?: Role[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useRouterState({ select: (s) => s.location });

  if (!user) {
    return <Navigate to="/auth" search={{ mode: "signin", redirect: location.href }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/access-denied" />;
  }

  return <>{children}</>;
}
