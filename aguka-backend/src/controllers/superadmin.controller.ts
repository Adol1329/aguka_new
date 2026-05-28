import { Request, Response, NextFunction } from "express";
import { superAdminService } from "../services/superAdmin.service.js";
import { RequestWithUser } from "../types/index.js";

export const getDashboardStats = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const stats = await superAdminService.getDashboardStats();
    return res.json({ success: true, data: stats });
  } catch (error: any) {
    return next(error);
  }
};

export const getAllUsers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, role, search, status } = req.query;
    const result = await superAdminService.getAllUsers({
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      role: role as string,
      search: search as string,
      status: status as string,
    });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const createUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await superAdminService.createUser(req.body);
    return res
      .status(201)
      .json({ success: true, data: { id: user.id, phone: user.phone } });
  } catch (error: any) {
    return next(error);
  }
};

export const updateUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await superAdminService.updateUser(
      req.params.id,
      req.body,
      req.user!.sub,
    );
    return res.json({ success: true, data: user });
  } catch (error: any) {
    return next(error);
  }
};

export const deleteUser = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    await superAdminService.deleteUser(req.params.id, req.user!.sub);
    return res.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return next(error);
  }
};

export const getAuditLogs = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, userId, action } = req.query;
    const result = await superAdminService.getAuditLogs({
      page: Number(page) || 1,
      limit: Number(limit) || 50,
      userId: userId as string,
      action: action as string,
    });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const getSystemHealth = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const health = await superAdminService.getSystemHealth();
    return res.json({ success: true, data: health });
  } catch (error: any) {
    return next(error);
  }
};

export const getReports = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const reports = await superAdminService.getReports();
    return res.json({ success: true, data: reports });
  } catch (error: any) {
    return next(error);
  }
};

export const getCooperatives = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const coops = await superAdminService.getCooperatives();
    return res.json({ success: true, data: coops });
  } catch (error: any) {
    return next(error);
  }
};

export const getBackups = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const backups = await superAdminService.getBackups();
    return res.json({ success: true, data: backups });
  } catch (error: any) {
    return next(error);
  }
};

export const createBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const backup = await superAdminService.createBackup(req.user!.sub);
    return res.status(201).json({ success: true, data: backup });
  } catch (error: any) {
    return next(error);
  }
};

export const deleteBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.deleteBackup(req.params.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const restoreBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await superAdminService.restoreBackup(req.params.id);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};

export const downloadBackup = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const backup = await superAdminService.getBackupDownload(req.params.id);
    return res.download(backup.filePath, backup.filename);
  } catch (error: any) {
    return next(error);
  }
};

export const getSettings = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await superAdminService.getSystemSettings();
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return next(error);
  }
};

export const updateSetting = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { value } = req.body;
    const setting = await superAdminService.updateSystemSetting(
      req.params.key,
      value,
    );
    return res.json({ success: true, data: setting });
  } catch (error: any) {
    return next(error);
  }
};

export const updateSettings = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const settings = await superAdminService.updateSystemSettings(req.body);
    return res.json({ success: true, data: settings });
  } catch (error: any) {
    return next(error);
  }
};

export const getRoles = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await superAdminService.getRoles();
    return res.json({ success: true, data: roles });
  } catch (error: any) {
    return next(error);
  }
};

export const updateRolePermissions = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    const result = await superAdminService.updateRolePermissions(
      role,
      permissions,
    );
    return res.json({ success: true, data: result });
  } catch (error: any) {
    return next(error);
  }
};
