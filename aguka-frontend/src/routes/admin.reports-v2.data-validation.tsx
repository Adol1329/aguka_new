import { createFileRoute } from "@tanstack/react-router";
import { makeReportRoute } from "@/components/reports-v2/route-helper";

export const Route = createFileRoute("/admin/reports-v2/data-validation")({
  component: makeReportRoute("admin", "data-validation"),
});
