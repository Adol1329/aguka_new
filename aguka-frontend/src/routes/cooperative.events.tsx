import { createFileRoute } from "@tanstack/react-router";
import { GroupActivitiesComponent } from "@/components/group-activities";

export const Route = createFileRoute("/cooperative/events")({
  component: GroupActivitiesComponent,
});
