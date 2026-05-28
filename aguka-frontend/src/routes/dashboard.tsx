import { createFileRoute, redirect } from "@tanstack/react-router";
import { tabSession } from "@/utils/tabSession";

const roleRoutes: Record<string, string> = {
  farmer: "/farmer",
  admin: "/admin",
  officer: "/officer",
  cooperative: "/cooperative",
  super_admin: "/super-admin",
};

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const session = tabSession.get();
    if (!session?.token) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }

    throw redirect({ to: (roleRoutes[session.role] ?? "/auth") as any });
  },
});
