import { createFileRoute } from "@tanstack/react-router";
import { makeReportRoute } from "@/components/reports-v2/route-helper";

export const Route = createFileRoute("/cooperative/reports-v2/production")({
  component: makeReportRoute("cooperative", "production"),
});
