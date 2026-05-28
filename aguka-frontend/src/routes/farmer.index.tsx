import { createFileRoute } from "@tanstack/react-router";
import { FarmerDashboardComponent } from "@/components/farmer-dashboard";

export const Route = createFileRoute("/farmer/")({
  component: FarmerDashboardComponent,
});

