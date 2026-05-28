export { apiClient, setUnauthorizedHandler, ApiError } from './client';
export type { ApiResponse } from './client';

export { authApi } from './auth';
export type { LoginInput, RegisterInput, AuthResponse } from './auth';

export { farmersApi } from './farmers';
export type { UserProfile, FarmerCrop, FarmerListResponse } from './farmers';

export { soilApi } from './soil';
export type { SoilReading, SoilStatus } from './soil';

export { weatherApi } from './weather';
export type { WeatherReading, WeatherForecast } from './weather';

export { irrigationApi } from './irrigation';
export type { IrrigationSchedule, IrrigationLog, IrrigationStatus } from './irrigation';

export { usersApi } from './users';
export type { ApiUser } from './users';

export { notificationApi, notificationsApi } from './notifications';
export type { Notification, NotificationRule } from './notifications';

export { locationApi } from './location';
export type { LocationItem } from './location';

export { cooperativeApi } from './cooperative';
export type { CooperativeMember, CooperativeResource, CooperativeActivity } from './cooperative';

export { marketApi } from './market';
export type { MarketPrice, PriceAlert } from './market';

export { activitiesApi } from './activities';
export type { Activity, ActivitiesResponse } from './activities';

export { auditApi } from './audit';
export type { AuditLog } from './audit';

export { searchApi } from './search';
export type { SearchResult, GlobalSearchResponse } from './search';

export { superAdminApi } from './superadmin';
export type {
  SuperAdminDashboardStats,
  SuperAdminUser,
  AuditLogEntry,
  BackupEntry,
  SystemHealth,
  RoleInfo,
} from './superadmin';

export { forumApi } from './forum';
export type { ForumPost, ForumComment } from './forum';

export { reportsApi } from './reports';

export { officerApi } from './officer';
export { pestDiseaseApi } from './pest-disease';
export { livestockApi } from './livestock';
export { irrigationRecommendationApi } from './irrigation-recommendation';
export * from './ai';
