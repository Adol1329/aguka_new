import { Router } from "express";
import { asyncHandler } from "../middleware/error.middleware.js";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import { UserRole } from "../types/index.js";
import {
  getDashboardStats,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAuditLogs,
  getSystemHealth,
  getReports,
  getCooperatives,
  getBackups,
  createBackup,
  deleteBackup,
  restoreBackup,
  downloadBackup,
  getSettings,
  updateSettings,
  updateSetting,
  getRoles,
  updateRolePermissions,
  getBackupSchedule,
  saveBackupSchedule,
  getCustomRoles,
  saveCustomRoles,
  mergeUsers,
  resetUserPassword,
  getFeatureFlags,
  updateFeatureFlags,
  getPasswordPolicy,
  updatePasswordPolicy,
  getAuditRetention,
  updateAuditRetention,
  cleanupAuditLogs,
  forceLogoutUser,
  getAuditReportData,
  getHealthReportData,
  getBackupReportData,
  getSecurityReportData,
  getNationalReportData,
  exportAuditReport,
  exportHealthReport,
  exportBackupReport,
  exportSecurityReport,
  exportNationalReport,
} from "../controllers/superadmin.controller.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getDashboardStats),
);

router.get(
  "/users",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getAllUsers),
);

router.post(
  "/users",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(createUser),
);

router.patch(
  "/users/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(updateUser),
);

router.delete(
  "/users/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(deleteUser),
);

router.get(
  "/audit-logs",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getAuditLogs),
);

router.get(
  "/system-health",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getSystemHealth),
);

router.get(
  "/reports",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getReports),
);

router.get(
  "/cooperatives",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getCooperatives),
);

router.get(
  "/backups",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getBackups),
);

router.post(
  "/backups",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(createBackup),
);

router.delete(
  "/backups/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(deleteBackup),
);

router.post(
  "/backups/:id/restore",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(restoreBackup),
);

router.get(
  "/backups/:id/download",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(downloadBackup),
);

router.get(
  "/backup-schedule",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getBackupSchedule),
);

router.put(
  "/backup-schedule",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(saveBackupSchedule),
);

router.get(
  "/custom-roles",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getCustomRoles),
);

router.put(
  "/custom-roles",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(saveCustomRoles),
);

router.get(
  "/settings",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getSettings),
);

router.put(
  "/settings",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(updateSettings),
);

router.patch(
  "/settings/:key",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(updateSetting),
);

router.get(
  "/roles",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getRoles),
);

router.put(
  "/roles/:role/permissions",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(updateRolePermissions),
);

// ─── FEATURE 1: MERGE ACCOUNTS ───────────────

router.post(
  "/users/merge",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(mergeUsers),
);

// ─── FEATURE 2: RESET PASSWORD ───────────────

router.post(
  "/users/:id/reset-password",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(resetUserPassword),
);

// ─── FEATURE 6: FORCE LOGOUT ─────────────────

router.post(
  "/users/:id/force-logout",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(forceLogoutUser),
);

// ─── FEATURE 3: FEATURE FLAGS ────────────────

router.get(
  "/feature-flags",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getFeatureFlags),
);

router.put(
  "/feature-flags",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(updateFeatureFlags),
);

// ─── FEATURE 4: PASSWORD POLICY ──────────────

router.get(
  "/security/password-policy",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getPasswordPolicy),
);

router.put(
  "/security/password-policy",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(updatePasswordPolicy),
);

// ─── FEATURE 5: AUDIT RETENTION ──────────────

router.get(
  "/audit-logs/retention",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getAuditRetention),
);

router.put(
  "/audit-logs/retention",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(updateAuditRetention),
);

router.post(
  "/audit-logs/cleanup",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(cleanupAuditLogs),
);

// ─── SUPER ADMIN REPORTS ENDPOINTS ──────────────

router.get(
  "/reports/audit/data",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getAuditReportData),
);
router.get(
  "/reports/health/data",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getHealthReportData),
);
router.get(
  "/reports/backup/data",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getBackupReportData),
);
router.get(
  "/reports/security/data",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getSecurityReportData),
);
router.get(
  "/reports/national/data",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(getNationalReportData),
);

router.post(
  "/reports/audit/export",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(exportAuditReport),
);
router.post(
  "/reports/health/export",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(exportHealthReport),
);
router.post(
  "/reports/backup/export",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(exportBackupReport),
);
router.post(
  "/reports/security/export",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(exportSecurityReport),
);
router.post(
  "/reports/national/export",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  asyncHandler(exportNationalReport),
);

export default router;
