import { createFileRoute } from "@tanstack/react-router";
import { UserManagementComponent } from "@/components/user-management";

export const Route = createFileRoute("/super-admin/users")({
  component: UserManagementComponent,
});
