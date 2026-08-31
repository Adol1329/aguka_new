import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

export async function cleanAuditLogs() {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "AUDIT_RETENTION_DAYS" },
  });
  const retentionDays = setting?.value ? parseInt(setting.value, 10) : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - retentionDays);

  const archiveSetting = await prisma.systemSetting.findUnique({
    where: { key: "AUDIT_ARCHIVE_BEFORE_CLEANUP" },
  });

  if (archiveSetting?.value === "true") {
    const logsToDelete = await prisma.auditLog.findMany({
      where: { createdAt: { lt: cutoff } },
      orderBy: { createdAt: "asc" },
      take: 50000,
    });
    if (logsToDelete.length > 0) {
      const fs = await import("fs/promises");
      const csvPath = `audit-archive-${Date.now()}.csv`;
      const headers =
        "id,userId,action,resourceType,resourceId,createdAt,ipAddress\n";
      const rows = logsToDelete
        .map(
          (l) =>
            `${l.id},${l.userId},"${l.action.replace(/"/g, '""')}","${(l.resourceType || "").replace(/"/g, '""')}","${(l.resourceId || "").replace(/"/g, '""')}",${l.createdAt.toISOString()},"${l.ipAddress || ""}"`,
        )
        .join("\n");
      await fs.writeFile(csvPath, headers + rows, "utf-8");
      logger.info(`Archived ${logsToDelete.length} audit logs to ${csvPath}`);
    }
  }

  const result = await prisma.auditLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  if (result.count > 0) {
    logger.info(
      `Cleaned up ${result.count} audit logs older than ${retentionDays} days`,
    );
  }

  return result.count;
}
