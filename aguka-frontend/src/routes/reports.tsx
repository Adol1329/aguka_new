import { createFileRoute, Outlet, Link, redirect } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useAuth, getStoredUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Droplets, 
  CloudSun, 
  ClipboardList,
  FileText
} from "lucide-react";

export const Route = createFileRoute("/reports")({
  beforeLoad: () => {
    const user = getStoredUser();
    if (!user) {
      throw redirect({ to: "/auth", search: { mode: "signin" } });
    }
    const allowed = ["super_admin", "admin", "cooperative", "officer", "farmer"];
    if (!allowed.includes(user.role)) {
      throw redirect({ to: "/access-denied" as any });
    }
  },
  component: ReportsLayout,
});

function ReportsLayout() {
  const { user } = useAuth();
  const tabs = [
    { name: "Overview", href: "/reports/", icon: FileText },
    { name: "Soil", href: "/reports/soil", icon: BarChart3 },
    { name: "Irrigation", href: "/reports/irrigation", icon: Droplets },
    { name: "Weather", href: "/reports/weather", icon: CloudSun },
    { name: "Activities", href: "/reports/activities", icon: ClipboardList },
  ];

  return (
    <DashboardLayout role={user?.role || "farmer"}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Interactive Reports</h1>
            <p className="text-muted-foreground">
              Analyze your farm data and export professional reports.
            </p>
          </div>
        </div>

        <div className="flex border-b overflow-x-auto pb-px">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href as any} // Keeping as any for now because of nested route path types
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent transition-colors hover:text-primary [&.active]:border-primary [&.active]:text-primary whitespace-nowrap"
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </DashboardLayout>
  );
}
