import { z } from "zod";
import { WaterSource, IrrigationType, AccessChannel } from "@prisma/client";

export const farmerOnboardingSchema = z.object({
  fullName: z.string().min(2).max(255),
  farmName: z.string().max(255).optional(),
  location: z.string().min(2).max(255).optional(),
  provinceCode: z.string(),
  districtCode: z.string(),
  sectorCode: z.string().length(6),
  cellCode: z.string(),
  villageCode: z.string(),
  district: z.string(),
  sector: z.string(),
  cell: z.string().optional(),
  village: z.string().optional(),
  farmSizeHectares: z.number().positive(),
  waterSource: z.nativeEnum(WaterSource),
  irrigationType: z.nativeEnum(IrrigationType).default(IrrigationType.none),
  preferredChannel: z.nativeEnum(AccessChannel).default(AccessChannel.smartphone),
  crops: z.array(z.string()).optional(),
  livestock: z.array(z.string()).optional(),
});

export const officerOnboardingSchema = z.object({
  fullName: z.string().min(2).max(255),
  employeeId: z.string().min(2).max(50),
  organization: z.string().min(2).max(255),
  specialization: z.string().min(2).max(100),
  assignedDistrict: z.string().min(2).max(100),
  assignedSector: z.string().min(2).max(100),
});

export const cooperativeOnboardingSchema = z.object({
  cooperativeName: z.string().min(2).max(255),
  registrationNumber: z.string().min(2).max(100),
  operationalRegion: z.string().min(2).max(255),
  memberCapacity: z.number().int().positive(),
  hasStorageFacility: z.boolean().default(false),
});
