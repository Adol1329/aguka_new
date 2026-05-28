import { Response, NextFunction } from "express";
import { userService } from "../services/user.service.js";
import { farmerService } from "../services/farmer.service.js";
import { UserRole } from "../types/index.js";
import { RequestWithUser } from "../types/index.js";

export const getMyProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getProfile(req.user!.sub);
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const updateMyProfile = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.updateProfile(req.user!.sub, req.body);
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const getMyFarm = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profile = await farmerService.getProfile(req.user!.sub);
    return res.json({ success: true, data: profile });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const listUsers = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as UserRole;

    const result = await userService.listUsers({
      page,
      limit,
      role,
      excludeRole: req.query.excludeRole as UserRole,
      search: req.query.search as string,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const updateUserRole = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.updateUserRole(
      req.params.id,
      req.body.role,
      req.user!.sub,
    );
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const updateUserStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { status, isActive } = req.body;
    const user = await userService.updateUserStatus(
      req.params.id,
      status,
      isActive,
      req.user!.sub,
    );
    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};

export const bulkUpdateStatus = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { userIds, status, isActive } = req.body;
    const result = await userService.bulkUpdateStatus(
      userIds,
      status,
      isActive,
      req.user!.sub,
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const uploadAvatarController = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await userService.updateProfile(req.user!.sub, { avatarUrl });

    return res.json({ success: true, data: user });
  } catch (error) {
    return next(error);
  }
};
