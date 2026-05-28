import { z } from "zod";
import { PaginationSchema } from "./common.validator.js";

export const getFarmersSchema = z.object({
  ...PaginationSchema.shape,
  district: z.string().optional(),
  sector: z.string().optional(),
  cooperativeId: z.string().uuid().optional(),
  search: z.string().optional(),
});

export const farmerIdSchema = z.object({
  id: z.string().uuid(),
});

export const assignFarmerSchema = z.object({
  farmerId: z.string().uuid(),
  extensionOfficerId: z.string().uuid().optional(),
});

export const soilReadingSchema = z.object({
  sensorId: z.string().uuid().optional(),
  moisturePercent: z.number().min(0).max(100),
  temperatureCelsius: z.number().optional(),
  soilTemperatureCelsius: z.number().optional(),
  phLevel: z.number().min(0).max(14).optional(),
  nitrogenPpm: z.number().min(0).optional(),
  phosphorusPpm: z.number().min(0).optional(),
  potassiumPpm: z.number().min(0).optional(),
});

export const weatherReadingSchema = z.object({
  weatherStationId: z.string().optional(),
  temperatureCelsius: z.number(),
  humidityPercent: z.number().min(0).max(100),
  rainfallMm: z.number().min(0),
  windSpeedKmh: z.number().optional(),
  windDirection: z.string().optional(),
  pressureHpa: z.number().optional(),
  uvIndex: z.number().optional(),
  solarRadiationWm2: z.number().optional(),
});

export type GetFarmersInput = z.infer<typeof getFarmersSchema>;
export type FarmerIdInput = z.infer<typeof farmerIdSchema>;
export type AssignFarmerInput = z.infer<typeof assignFarmerSchema>;
export type SoilReadingInput = z.infer<typeof soilReadingSchema>;
export type WeatherReadingInput = z.infer<typeof weatherReadingSchema>;
