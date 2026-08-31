import { createFileRoute } from "@tanstack/react-router";
import { makeReportRoute } from "@/components/reports-v2/route-helper";

export const Route = createFileRoute("/super-admin/reports-v2/national")({
  component: makeReportRoute("super_admin", "national"),
});
