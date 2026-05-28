import { createFileRoute } from "@tanstack/react-router";
import { CooperativeResourcesComponent } from "@/components/cooperative-resources";

export const Route = createFileRoute("/cooperative/resources")({
  component: CooperativeResourcesComponent,
});
