import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard-ui";
import { ArrowRight, FileText, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import {
  HUB_SUBTITLE_KEY,
  HUB_TITLE_KEY,
  REPORTS_BY_ROLE,
  ROLE_SEGMENT,
  type ReportRole,
} from "./config";

const ACCENT_BG: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

export function ReportsV2Hub({ role }: { role: ReportRole }) {
  const { t } = useI18n();
  const segment = ROLE_SEGMENT[role];
  const reports = REPORTS_BY_ROLE[role];
  const title = String(t(HUB_TITLE_KEY[role] as any, {}));
  const subtitle = String(t(HUB_SUBTITLE_KEY[role] as any, {}));

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 text-sm text-muted-foreground">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <span>{String(t("reports_v2.hub.note" as any, {}))}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <Link
            key={r.slug}
            to={`/${segment}/reports-v2/${r.slug}` as any}
            className="group block focus:outline-none"
          >
            <Card className="h-full border-border/50 transition-all hover:border-primary/40 hover:shadow-md group-focus:ring-2 group-focus:ring-primary/40">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENT_BG[r.accent]}`}
                  >
                    <r.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </div>
                <CardTitle className="mt-3 text-base">{String(t(r.titleKey as any, {}))}</CardTitle>
                <CardDescription className="line-clamp-3 text-xs">
                  {String(t(r.subtitleKey as any, {}))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-primary">
                  <FileText className="h-3 w-3" />
                  <span className="font-semibold">
                    {String(t("reports_v2.hub.open_report" as any, {}))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
