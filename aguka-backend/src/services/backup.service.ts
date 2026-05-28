import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import { prisma } from "../prisma.js";

const execAsync = promisify(exec);

const quoteArg = (value: string) => `"${value.replace(/"/g, '\\"')}"`;

const resolvePgTool = (tool: "pg_dump" | "psql") => {
  const envKey = tool === "pg_dump" ? "PG_DUMP_PATH" : "PSQL_PATH";
  const configured = process.env[envKey];
  if (configured) return configured;

  const windowsCandidates = [
    `C:\\Program Files\\PostgreSQL\\17\\bin\\${tool}.exe`,
    `C:\\Program Files\\PostgreSQL\\16\\bin\\${tool}.exe`,
    `C:\\Program Files\\PostgreSQL\\15\\bin\\${tool}.exe`,
    `C:\\Program Files\\PostgreSQL\\14\\bin\\${tool}.exe`,
    `C:\\Program Files\\PostgreSQL\\17\\pgAdmin 4\\runtime\\${tool}.exe`,
  ];

  const match = windowsCandidates.find((candidate) => fs.existsSync(candidate));
  return match || tool;
};

const getDatabaseConfig = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const dbUrl = new URL(process.env.DATABASE_URL);
  return {
    dbName: dbUrl.pathname.slice(1),
    dbHost: dbUrl.hostname,
    dbPort: dbUrl.port || "5432",
    dbUser: decodeURIComponent(dbUrl.username),
    dbPass: decodeURIComponent(dbUrl.password),
  };
};

export async function createDatabaseBackup(createdBy: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `aguka_backup_${timestamp}.sql`;
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, filename);
  const { dbName, dbHost, dbPort, dbUser, dbPass } = getDatabaseConfig();

  const pending = await prisma.backup.create({
    data: {
      name: filename,
      type: "MANUAL",
      status: "IN_PROGRESS",
      filePath: backupPath,
      createdBy,
    },
  });

  try {
    const command = [
      quoteArg(resolvePgTool("pg_dump")),
      "-h",
      quoteArg(dbHost),
      "-p",
      quoteArg(dbPort),
      "-U",
      quoteArg(dbUser),
      "-d",
      quoteArg(dbName),
      "-F",
      "p",
      "-f",
      quoteArg(backupPath),
    ].join(" ");

    await execAsync(command, {
      env: { ...process.env, PGPASSWORD: dbPass },
      windowsHide: true,
    });

    const stats = fs.statSync(backupPath);

    return prisma.backup.update({
      where: { id: pending.id },
      data: {
        status: "COMPLETED",
        sizeBytes: stats.size,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    await prisma.backup.update({
      where: { id: pending.id },
      data: { status: "FAILED", completedAt: new Date() },
    });
    throw error;
  }
}

export async function restoreDatabaseBackup(backupId: string) {
  const backup = await prisma.backup.findUnique({ where: { id: backupId } });

  if (!backup) throw new Error("Backup not found");
  if (!backup.filePath || !fs.existsSync(backup.filePath)) {
    throw new Error("Backup file not found on disk");
  }

  const { dbName, dbHost, dbPort, dbUser, dbPass } = getDatabaseConfig();
  const command = [
    quoteArg(resolvePgTool("psql")),
    "-h",
    quoteArg(dbHost),
    "-p",
    quoteArg(dbPort),
    "-U",
    quoteArg(dbUser),
    "-d",
    quoteArg(dbName),
    "-f",
    quoteArg(backup.filePath),
  ].join(" ");

  await execAsync(command, {
    env: { ...process.env, PGPASSWORD: dbPass },
    windowsHide: true,
  });

  await (prisma.backup.update as any)({
    where: { id: backupId },
    data: { status: "RESTORED", restoredAt: new Date() },
  });

  return { success: true, message: "Database restored successfully" };
}

export async function getBackupDownloadPath(backupId: string) {
  const backup = await prisma.backup.findUnique({ where: { id: backupId } });

  if (!backup || !backup.filePath || !fs.existsSync(backup.filePath)) {
    throw new Error("Backup file not found");
  }

  return {
    filePath: backup.filePath,
    filename: path.basename(backup.filePath),
  };
}
