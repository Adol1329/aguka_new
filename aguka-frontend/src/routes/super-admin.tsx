import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getStoredUser, canAccessRoute } from "@/lib/auth";

export const Route = createFileRoute("/super-admin")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    if (user.requiresPasswordChange) {
      throw redirect({ to: "/change-password" as any });
    }
    const path = window.location.pathname.replace(/\/$/, "") || "/super-admin";
    if (!canAccessRoute(user.role, path)) {
      throw redirect({ to: "/access-denied" as any });
    }
  },
  component: () => <DashboardLayout role="super_admin" />,
});
