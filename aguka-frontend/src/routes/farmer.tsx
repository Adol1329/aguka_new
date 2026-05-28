import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getStoredUser, canAccessRoute } from "@/lib/auth";

export const Route = createFileRoute("/farmer")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    if (user.requiresPasswordChange) {
      throw redirect({ to: "/change-password" as any });
    }
    if (!canAccessRoute(user.role, "/farmer")) {
      throw redirect({ to: "/access-denied" as any });
    }
  },
  component: () => <DashboardLayout role="farmer" />,
});
