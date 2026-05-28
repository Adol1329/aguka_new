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
  "/settings",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  asyncHandler(getSettings),
);

router.put(
  "/settings",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
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

export default router;
