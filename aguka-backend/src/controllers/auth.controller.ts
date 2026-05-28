import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service.js";
import { RequestWithUser } from "../types/index.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.login(req.body);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const checkForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.checkForgotPassword(req.body.phone);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const verifyResetOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone, otp } = req.body;
    const result = await authService.verifyResetOtp(phone, otp);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const resetPasswordWithOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const result = await authService.resetPasswordWithOtp(phone, otp, newPassword);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const forceChangePassword = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.forceChangePassword(
      req.user!.sub,
      req.body.newPassword,
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const requestOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.requestOtp(req.body.phone);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const verifyPhone = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.verifyPhone(req.body.phone, req.body.otp);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const firebaseVerify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Firebase ID Token required",
        },
      });
    }
    const result = await authService.verifyFirebaseToken(idToken);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Refresh token required" },
      });
    }
    const result = await authService.refreshToken(refreshToken);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : undefined;
    const result = await authService.logout(req.user!.sub, token, req.user!.exp);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.changePassword(
      req.user!.sub,
      req.body.currentPassword,
      req.body.newPassword,
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.forgotPassword(req.body.phone);
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await authService.resetPassword(
      req.body.token,
      req.body.newPassword,
    );
    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
