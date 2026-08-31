import { createFileRoute } from "@tanstack/react-router";
import { makeReportRoute } from "@/components/reports-v2/route-helper";

export const Route = createFileRoute("/farmer/reports-v2/seasonal")({
  component: makeReportRoute("farmer", "seasonal"),
});
