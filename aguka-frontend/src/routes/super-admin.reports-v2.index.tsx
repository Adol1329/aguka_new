import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ReportCard } from "../components/super-admin/ReportCard";
import { ReportModal } from "../components/super-admin/ReportModal";
import { Shield, Activity, Database, Lock, Map } from "lucide-react";
import {
  useAuditReport,
  useHealthReport,
  useBackupReport,
  useSecurityReport,
  useNationalReport,
} from "../hooks/useSuperAdminReports";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export const Route = createFileRoute("/super-admin/reports-v2/")({
  component: SuperAdminReportsPage,
});

function SuperAdminReportsPage() {
  const [activeReport, setActiveReport] = useState<string | null>(null);

  const audit = useAuditReport();
  const health = useHealthReport();
  const backup = useBackupReport();
  const security = useSecurityReport();
  const national = useNationalReport();

  const handleOpen = (reportName: string) => {
    setActiveReport(reportName);
    if (reportName === "audit") audit.fetch();
    if (reportName === "health") health.fetch();
    if (reportName === "backup") backup.fetch();
    if (reportName === "security") security.fetch();
    if (reportName === "national") national.fetch();
  };

  const handleExport = (reportName: string, format: string) => {
    if (reportName === "audit") audit.exportReport(format);
    if (reportName === "health") health.exportReport(format);
    if (reportName === "backup") backup.exportReport(format);
    if (reportName === "security") security.exportReport(format);
    if (reportName === "national") national.exportReport(format);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Reports</h1>
          <p className="text-muted-foreground mt-1">
            Verifiable system reports with real-time data
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ReportCard
          title="Audit Log Report"
          description="Cryptographically verifiable audit trail of system actions"
          icon={<Shield className="h-6 w-6" />}
          onOpen={() => handleOpen("audit")}
          onExport={(f) => handleExport("audit", f)}
        />
        <ReportCard
          title="System Health Report"
          description="Database, API, and worker health with latency & uptime"
          icon={<Activity className="h-6 w-6" />}
          onOpen={() => handleOpen("health")}
          onExport={(f) => handleExport("health", f)}
        />
        <ReportCard
          title="Backup & Recovery Report"
          description="Backup schedules, sizes, statuses, and recovery tests"
          icon={<Database className="h-6 w-6" />}
          onOpen={() => handleOpen("backup")}
          onExport={(f) => handleExport("backup", f)}
        />
        <ReportCard
          title="Security & Threat Report"
          description="Failed logins, suspicious IPs, and permission changes"
          icon={<Lock className="h-6 w-6" />}
          onOpen={() => handleOpen("security")}
          onExport={(f) => handleExport("security", f)}
        />
        <ReportCard
          title="National Performance Report"
          description="Aggregated agricultural view by district, season, crop"
          icon={<Map className="h-6 w-6" />}
          onOpen={() => handleOpen("national")}
          onExport={(f) => handleExport("national", f)}
        />
      </div>

      {/* Audit Modal */}
      <ReportModal
        open={activeReport === "audit"}
        onOpenChange={(v) => !v && setActiveReport(null)}
        title="Audit Log Report"
        loading={audit.loading}
        data={audit.data}
        onExport={(f) => handleExport("audit", f)}
        renderCharts={(d) => (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.activityByHour}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Actions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        renderDetails={(d) => (
          <div className="space-y-4">
            <h3 className="font-bold">Recent Logs</h3>
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {d.recentLogs.map((l: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="p-2">{l.user}</td>
                    <td className="p-2">{l.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* Health Modal */}
      <ReportModal
        open={activeReport === "health"}
        onOpenChange={(v) => !v && setActiveReport(null)}
        title="System Health Report"
        loading={health.loading}
        data={health.data}
        onExport={(f) => handleExport("health", f)}
        renderCharts={(d) => (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.api.endpoints} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="path" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="avgTime" fill="#00C49F" name="Avg Response Time (ms)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        renderDetails={(d) => (
          <div className="space-y-4">
            <h3 className="font-bold">Database Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border p-4 rounded bg-muted/20">
                Active Connections: <b>{d.database.connections.active}</b>
              </div>
              <div className="border p-4 rounded bg-muted/20">
                Idle Connections: <b>{d.database.connections.idle}</b>
              </div>
            </div>
            <h3 className="font-bold mt-6">API Endpoints</h3>
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Path</th>
                  <th className="p-2 text-left">Calls</th>
                  <th className="p-2 text-left">Avg Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {d.api.endpoints.map((l: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{l.path}</td>
                    <td className="p-2">{l.calls}</td>
                    <td className="p-2">{l.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* Backup Modal */}
      <ReportModal
        open={activeReport === "backup"}
        onOpenChange={(v) => !v && setActiveReport(null)}
        title="Backup & Recovery Report"
        loading={backup.loading}
        data={backup.data}
        onExport={(f) => handleExport("backup", f)}
        renderCharts={(d) => (
          <div className="flex h-64 items-center justify-center text-muted-foreground border border-dashed rounded bg-muted/10">
            <p>Chart: Backup Sizes Over Time (Data required)</p>
          </div>
        )}
        renderDetails={(d) => (
          <div className="space-y-4">
            <h3 className="font-bold">Backup History</h3>
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Type</th>
                  <th className="p-2 text-left">Size</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.backupHistory.map((l: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{l.name}</td>
                    <td className="p-2">{l.type}</td>
                    <td className="p-2">{l.size}</td>
                    <td className="p-2">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* Security Modal */}
      <ReportModal
        open={activeReport === "security"}
        onOpenChange={(v) => !v && setActiveReport(null)}
        title="Security & Threat Report"
        loading={security.loading}
        data={security.data}
        onExport={(f) => handleExport("security", f)}
        renderCharts={(d) => (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Failed Logins", value: d.failedLogins.total },
                    { name: "Suspicious IPs", value: d.summary.suspiciousIPsCount },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {[
                    { name: "Failed Logins", value: d.failedLogins.total },
                    { name: "Suspicious IPs", value: d.summary.suspiciousIPsCount },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
        renderDetails={(d) => (
          <div className="space-y-4">
            <h3 className="font-bold">Suspicious IPs</h3>
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">IP</th>
                  <th className="p-2 text-left">Attempts</th>
                  <th className="p-2 text-left">First Seen</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {d.suspiciousIPs.map((l: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{l.ip}</td>
                    <td className="p-2">{l.attempts}</td>
                    <td className="p-2">{new Date(l.firstSeen).toLocaleString()}</td>
                    <td className="p-2">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="font-bold mt-6">Permission Changes</h3>
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Time</th>
                  <th className="p-2 text-left">User</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {d.permissionChanges.map((l: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="p-2">{l.userName}</td>
                    <td className="p-2">{l.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      />

      {/* National Modal */}
      <ReportModal
        open={activeReport === "national"}
        onOpenChange={(v) => !v && setActiveReport(null)}
        title="National Performance Report"
        loading={national.loading}
        data={national.data}
        onExport={(f) => handleExport("national", f)}
        renderCharts={(d) => (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.byDistrict}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="averageYield" fill="#8884d8" name="Avg Yield (kg)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        renderDetails={(d) => (
          <div className="space-y-4">
            <h3 className="font-bold">By District</h3>
            <table className="w-full text-sm border">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">District</th>
                  <th className="p-2 text-left">Farmers</th>
                  <th className="p-2 text-left">Farm Area (ha)</th>
                  <th className="p-2 text-left">Avg Yield</th>
                  <th className="p-2 text-left">Soil Score</th>
                </tr>
              </thead>
              <tbody>
                {d.byDistrict.map((l: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{l.district}</td>
                    <td className="p-2">{l.farmers}</td>
                    <td className="p-2">{l.farmArea}</td>
                    <td className="p-2">{l.averageYield.toFixed(2)}</td>
                    <td className="p-2">{l.soilHealthScore.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h3 className="font-bold mt-6">Recommendations</h3>
            <div className="grid gap-2">
              {d.recommendations.map((r: any, i: number) => (
                <div key={i} className="border p-3 rounded bg-muted/10">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs text-white ${r.priority === "High" ? "bg-red-500" : "bg-yellow-500"}`}
                    >
                      {r.priority}
                    </span>
                    <span className="font-bold">{r.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
                  <p className="text-xs mt-2">
                    <b>Target Districts:</b> {r.targetDistricts.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  );
}
