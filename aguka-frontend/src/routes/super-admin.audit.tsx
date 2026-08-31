import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/audit")({
  loader: () => {
    throw redirect({ to: "/admin/audit" });
  },
});
