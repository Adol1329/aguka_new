import type { Request } from "express";

export enum UserRole {
  FARMER = "farmer",
  OFFICER = "officer",
  COOPERATIVE = "cooperative",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING_VERIFICATION = "pending_verification",
}

export enum Language {
  KINYARWANDA = "kinyarwanda",
  ENGLISH = "english",
  FRENCH = "french",
}

export enum AccessChannel {
  SMARTPHONE = "smartphone",
  BASIC_PHONE = "basic_phone",
  USSD = "ussd",
  SMS = "sms",
  VOICE = "voice",
}

export enum WaterSource {
  RAINWATER = "rainwater",
  WELL = "well",
  RIVER = "river",
  MUNICIPAL = "municipal",
  OTHER = "other",
}

export enum IrrigationType {
  DRIP = "drip",
  SPRINKLER = "sprinkler",
  MANUAL = "manual",
  FLOOD = "flood",
  NONE = "none",
}

export enum SensorType {
  SOIL_MOISTURE = "soil_moisture",
  SOIL_TEMPERATURE = "soil_temperature",
  SOIL_PH = "soil_ph",
  NPK = "npk",
  WEATHER = "weather",
  WATER_LEVEL = "water_level",
  PUMP = "pump",
}

export enum AlertType {
  SOIL = "soil",
  WEATHER = "weather",
  IRRIGATION = "irrigation",
  PEST = "pest",
  DISEASE = "disease",
  MARKET = "market",
  SYSTEM = "system",
}

export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  CRITICAL = "critical",
}

export enum ActivityCategory {
  PLANTING = "planting",
  FERTILIZING = "fertilizing",
  IRRIGATION = "irrigation",
  PEST_CONTROL = "pest_control",
  HARVESTING = "harvesting",
  MAINTENANCE = "maintenance",
  OTHER = "other",
}

export enum ReportType {
  SEASONAL = "seasonal",
  YIELD = "yield",
  FINANCIAL = "financial",
  GOVERNMENT = "government",
  COOPERATIVE = "cooperative",
}

export enum NotificationChannel {
  APP = "app",
  SMS = "sms",
  USSD = "ussd",
  VOICE = "voice",
  EMAIL = "email",
}

export interface JwtPayload {
  sub: string;
  phone: string;
  role: UserRole;
  cooperativeId?: string;
  officerId?: string;
  assignedFarmers?: string[];
  iat: number;
  exp: number;
}

export interface RefreshTokenPayload {
  sub: string;
  type: "refresh";
  iat: number;
  exp: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  district?: string;
  sector?: string;
}

export interface SoilReading {
  id: string;
  sensorId: string | null;
  farmerId: string;
  moisturePercent: number;
  temperatureCelsius?: number;
  soilTemperatureCelsius?: number;
  phLevel?: number;
  nitrogenPpm?: number;
  phosphorusPpm?: number;
  potassiumPpm?: number;
  soilHealthScore?: number;
  readingAt: Date;
}

export interface WeatherReading {
  id: string;
  farmerId: string;
  weatherStationId?: string;
  temperatureCelsius?: number;
  humidityPercent?: number;
  rainfallMm?: number;
  windSpeedKmh?: number;
  windDirection?: string;
  pressureHpa?: number;
  uvIndex?: number;
  solarRadiationWm2?: number;
  forecast24hr?: Record<string, unknown>;
  forecast7day?: Record<string, unknown>;
  readingAt: Date;
}

export interface Crop {
  id: string;
  nameEn: string;
  nameRw?: string;
  nameFr?: string;
  category: string;
  growingPeriodDays?: number;
  waterRequirement?: number;
  nitrogenRequirement?: number;
  phosphorusRequirement?: number;
  potassiumRequirement?: number;
  optimalPhMin?: number;
  optimalPhMax?: number;
  optimalTempMin?: number;
  optimalTempMax?: number;
}

export interface IrrigationSchedule {
  id: string;
  farmerId: string;
  cropId?: string;
  scheduleType: "automatic" | "manual" | "weather_based";
  startTime?: string;
  durationMinutes?: number;
  frequency: string;
  daysOfWeek?: number[];
  waterSource?: WaterSource;
  waterAmountLiters?: number;
  pumpEnabled: boolean;
  valveEnabled: boolean;
  isActive: boolean;
}

export interface FarmerProfile {
  id: string;
  userId: string;
  cooperativeId?: string;
  fullName: string;
  farmName?: string;
  location: string;
  district: string;
  sector: string;
  cell?: string;
  village?: string;
  provinceCode?: string;
  districtCode?: string;
  sectorCode?: string;
  cellCode?: string;
  villageCode?: string;
  farmSizeHectares?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  elevationMeters?: number;
  soilType?: string;
  waterSource?: WaterSource;
  irrigationType?: IrrigationType;
  preferredChannel: AccessChannel;
  literacyLevel?: string;
  emergencyContact?: string;
  familyMembers?: number;
}

export interface User {
  id: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  role: UserRole;
  language: Language;
  status: UserStatus;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cooperative {
  id: string;
  name: string;
  registrationNumber?: string;
  district: string;
  sector: string;
  contactPhone?: string;
  contactEmail?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Alert {
  id: string;
  farmerId: string;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  recommendation?: string;
  isRead: boolean;
  channel: NotificationChannel;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  channel: NotificationChannel;
  sentAt?: Date;
  deliveredAt?: Date;
  status: "pending" | "sent" | "delivered" | "failed";
  createdAt: Date;
}

export type Permission =
  | "read:own_profile"
  | "write:own_profile"
  | "read:assigned_farmers"
  | "read:assigned_soil"
  | "write:assigned_recommendations"
  | "read:cooperative_farmers"
  | "read:cooperative_stats"
  | "write:users"
  | "read:audit_logs"
  | "write:system_config"
  | "read:all_farmers"
  | "write:all_alerts"
  | "*";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.FARMER]: ["read:own_profile", "write:own_profile"],
  [UserRole.OFFICER]: [
    "read:own_profile",
    "write:own_profile",
    "read:assigned_farmers",
    "read:assigned_soil",
    "write:assigned_recommendations",
  ],
  [UserRole.COOPERATIVE]: [
    "read:own_profile",
    "write:own_profile",
    "read:assigned_farmers",
    "read:cooperative_farmers",
    "read:cooperative_stats",
  ],
  [UserRole.ADMIN]: [
    "read:own_profile",
    "write:own_profile",
    "read:all_farmers",
    "write:users",
    "read:audit_logs",
    "write:system_config",
  ],
  [UserRole.SUPER_ADMIN]: ["*"],
};

export interface RequestWithUser extends Request {
  user?: JwtPayload;
  query: any;
  params: any;
  body: any;
  farmerId?: string;
}

// Alias for backward compatibility
export type AuthenticatedRequest = RequestWithUser;

// Re-export Request type for compatibility
export type { Request } from "express";
