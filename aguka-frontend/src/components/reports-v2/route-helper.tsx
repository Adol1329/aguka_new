import { PageHeader } from "@/components/dashboard-ui";
import { ReportPage } from "./page";
import { REPORT_REGISTRY, type ReportRole, type ReportType } from "./config";
import { useI18n } from "@/lib/i18n";

export function makeReportRoute(role: ReportRole, type: ReportType) {
  const key = `${role}.${type}`;
  const config = REPORT_REGISTRY[key];
  return function ReportRouteComponent() {
    const { t } = useI18n();
    const title = String(t(config.titleKey as any, {}));
    const subtitle = String(t(config.subtitleKey as any, {}));
    return (
      <div className="space-y-4">
        <PageHeader title={title} subtitle={subtitle} />
        <ReportPage
          role={role}
          reportType={type}
          showFarmer={role !== "farmer"}
          showDistrict={true}
          showCooperative={["officer", "admin", "super_admin"].includes(role)}
          showCrop={config.showCrop}
          showSeason={config.showSeason}
        />
      </div>
    );
  };
}
