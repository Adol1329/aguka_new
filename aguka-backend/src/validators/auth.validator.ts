import { z } from "zod";
import { UserRole, Language, AccessChannel } from "../types/index.js";

export const registerSchema = z.object({
  phone: z.string().min(10).max(15),
  email: z.string().email().nullable().optional(),
  password: z.string().min(8).max(100).optional(),
  role: z.nativeEnum(UserRole).default(UserRole.FARMER),
  language: z
    .enum(["kinyarwanda", "english", "french", "en", "rw", "fr"])
    .transform((val) => {
      if (val === "en") return Language.ENGLISH;
      if (val === "rw") return Language.KINYARWANDA;
      if (val === "fr") return Language.FRENCH;
      return val as Language;
    })
    .default(Language.KINYARWANDA),
  fullName: z.string().min(2).max(255),
});

export const loginSchema = z.object({
  phone: z.string().min(10).max(15),
  password: z.string().min(1),
});

export const requestOtpSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export const forgotPasswordSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const forgotPasswordCheckSchema = z.object({
  phone: z.string().min(10).max(15),
});

export const verifyResetOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
});

export const resetPasswordWithOtpSchema = z.object({
  phone: z.string().min(10).max(15),
  otp: z.string().length(6),
  newPassword: z.string().min(8).max(100),
});

export const forceChangePasswordSchema = z.object({
  newPassword: z.string().min(8).max(100),
});

export const adminResetPasswordSchema = z.object({}).strict();

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  language: z.nativeEnum(Language).optional(),
  fullName: z.string().min(2).max(255).optional(),
  farmName: z.string().max(255).optional(),
  location: z.string().min(2).max(255).optional(),
  district: z.string().min(2).max(100).optional(),
  sector: z.string().min(2).max(100).optional(),
  cell: z.string().max(100).optional(),
  village: z.string().max(100).optional(),
  provinceCode: z.string().optional(),
  districtCode: z.string().optional(),
  sectorCode: z.string().length(6).optional(),
  cellCode: z.string().optional(),
  villageCode: z.string().optional(),
  farmSizeHectares: z.number().positive().optional(),
  gpsLatitude: z.number().min(-90).max(90).optional(),
  gpsLongitude: z.number().min(-180).max(180).optional(),
  waterSource: z.string().optional(),
  irrigationType: z.string().optional(),
  preferredChannel: z.nativeEnum(AccessChannel).optional(),
  emergencyContact: z.string().max(15).optional(),
  familyMembers: z.number().int().min(0).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
