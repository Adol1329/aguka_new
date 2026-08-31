import { createFileRoute } from "@tanstack/react-router";
import { makeReportRoute } from "@/components/reports-v2/route-helper";

export const Route = createFileRoute("/farmer/reports-v2/soil-irrigation")({
  component: makeReportRoute("farmer", "soil-irrigation"),
});
