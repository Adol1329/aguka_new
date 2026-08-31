import { createFileRoute } from "@tanstack/react-router";
import { makeReportRoute } from "@/components/reports-v2/route-helper";

export const Route = createFileRoute("/admin/reports-v2/analytics-dashboard")({
  component: makeReportRoute("admin", "analytics-dashboard"),
});
