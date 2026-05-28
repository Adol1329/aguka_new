import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminDashboardComponent } from "@/components/super-admin-dashboard";

export const Route = createFileRoute("/super-admin/")({
  component: SuperAdminDashboardComponent,
});
