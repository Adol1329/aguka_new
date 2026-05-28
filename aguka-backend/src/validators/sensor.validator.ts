import { z } from "zod";

export const createSensorSchema = z.object({
  sensorType: z.enum([
    "soil_moisture",
    "soil_temperature",
    "soil_ph",
    "npk",
    "weather",
    "water_level",
    "pump",
  ]),
  serialNumber: z.string().min(1).max(100),
  locationOnFarm: z.string().max(100).optional(),
  installationDate: z.coerce.date().optional(),
});

export const updateSensorSchema = z.object({
  locationOnFarm: z.string().max(100).optional(),
  calibrationDate: z.coerce.date().optional(),
  isActive: z.boolean().optional(),
});

export const calibrateSensorSchema = z.object({
  calibrationDate: z.coerce.date(),
});

export type CreateSensorInput = z.infer<typeof createSensorSchema>;
export type UpdateSensorInput = z.infer<typeof updateSensorSchema>;
export type CalibrateSensorInput = z.infer<typeof calibrateSensorSchema>;
