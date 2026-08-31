import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/super-admin/backups")({
  loader: () => {
    throw redirect({ to: "/admin/backups" });
  },
});
