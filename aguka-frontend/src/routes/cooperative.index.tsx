import { createFileRoute } from "@tanstack/react-router";
import { CooperativeDashboardComponent } from "@/components/cooperative-dashboard";

export const Route = createFileRoute("/cooperative/")({
  component: CooperativeDashboardComponent,
});
