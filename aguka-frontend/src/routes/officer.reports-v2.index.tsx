import { createFileRoute } from "@tanstack/react-router";
import { ReportsV2Hub } from "@/components/reports-v2/hub";

export const Route = createFileRoute("/officer/reports-v2/")({
  component: () => <ReportsV2Hub role="officer" />,
});
