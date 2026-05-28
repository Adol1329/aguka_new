import { apiClient, ApiResponse } from './client';

export interface LoginInput {
  phone: string;
  password: string;
}

export interface RegisterInput {
  phone: string;
  email?: string;
  password?: string;
  role: string;
  fullName: string;
  farmName?: string;
  provinceCode: string;
  districtCode: string;
  sectorCode: string;
  cellCode: string;
  villageCode: string;
  farmSizeHectares?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  waterSource?: string;
  irrigationType?: string;
  preferredChannel?: string;
  emergencyContact?: string;
  familyMembers?: number;
}

export interface AuthResponse {
  user: {
    id: string;
    phone: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    role: string;
    language: string;
    status: string;
    isOnboarded: boolean;
    province?: string;
    district?: string;
    sector?: string;
    cell?: string;
    village?: string;
    createdAt: string;
    updatedAt: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  login: (data: LoginInput) =>
    apiClient.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterInput) =>
    apiClient.post<AuthResponse>('/auth/register', data),

  verifyFirebaseToken: (idToken: string) =>
    apiClient.post<AuthResponse>('/auth/firebase-verify', { idToken }),

  refreshToken: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', { refreshToken }),

  logout: () =>
    apiClient.post<ApiResponse>('/auth/logout'),

  requestOtp: (phone: string) =>
    apiClient.post<ApiResponse>('/auth/request-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<ApiResponse>('/auth/verify-phone', { phone, otp }),

  forgotPassword: (phone: string) =>
    apiClient.post<ApiResponse>('/auth/forgot-password', { phone }),

  checkForgotPassword: (phone: string) =>
    apiClient.post<{ exists: boolean; hasEmail?: boolean; maskedEmail?: string }>('/auth/forgot-password/check', { phone }),

  verifyResetOtp: (phone: string, otp: string) =>
    apiClient.post<{ success: boolean; error?: string }>('/auth/forgot-password/verify-otp', { phone, otp }),

  resetPasswordWithOtp: (phone: string, otp: string, newPassword: string) =>
    apiClient.post<{ success: boolean }>('/auth/forgot-password/reset', { phone, otp, newPassword }),

  forceChangePassword: (newPassword: string) =>
    apiClient.patch<{ success: boolean }>('/auth/change-password/force', { newPassword }),

  adminResetPassword: (userId: string) =>
    apiClient.patch<{ success: boolean; delivery?: string; maskedEmail?: string }>(`/admin/users/${userId}/reset-password`, {}),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post<ApiResponse>('/auth/reset-password', { token, newPassword }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post<ApiResponse>('/auth/change-password', { currentPassword, newPassword }),

  getMe: () =>
    apiClient.get<AuthResponse['user']>('/users/me'),

  updateMe: (data: any) =>
    apiClient.patch<AuthResponse['user']>('/users/me', data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.post<AuthResponse['user']>('/users/me/avatar', formData);
  },
};
