import { createFileRoute } from "@tanstack/react-router";
import { makeReportRoute } from "@/components/reports-v2/route-helper";

export const Route = createFileRoute("/officer/reports-v2/performance-comparison")({
  component: makeReportRoute("officer", "performance-comparison"),
});
