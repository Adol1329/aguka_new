import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/security")({
  loader: () => {
    throw redirect({ to: "/admin/security" });
  },
});
