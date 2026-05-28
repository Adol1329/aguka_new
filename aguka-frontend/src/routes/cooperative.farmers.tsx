import { createFileRoute } from "@tanstack/react-router";
import { CooperativeFarmersComponent } from "@/components/cooperative-farmers";

export const Route = createFileRoute("/cooperative/farmers")({
  component: CooperativeFarmersComponent,
});
