import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { z } from "zod";
import { sensorService } from "../services/sensor.service.js";
import { logger } from "../utils/logger.js";
import { prisma } from "../prisma.js";
import { RequestWithUser } from "../types/index.js";

const sensorReadingSchema = z.object({
  sensorId: z.string().optional(),
  serialNumber: z.string().optional(),
  farmerId: z.string().optional(),
  moisturePercent: z.number().min(0).max(100).optional(),
  temperatureCelsius: z.number().min(-50).max(80).optional(),
  phLevel: z.number().min(0).max(14).optional(),
  nitrogenPpm: z.number().min(0).max(500).optional(),
  phosphorusPpm: z.number().min(0).max(500).optional(),
  potassiumPpm: z.number().min(0).max(500).optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  signalStrength: z.number().min(-120).max(0).optional(),
  readingAt: z.string().datetime().optional(),
});

const weatherReadingSchema = z.object({
  weatherStationId: z.string().optional(),
  temperatureCelsius: z.number().min(-50).max(80),
  humidityPercent: z.number().min(0).max(100),
  rainfallMm: z.number().min(0).max(500),
  windSpeedKmh: z.number().min(0).max(200).optional(),
  windDirection: z.string().optional(),
  pressureHpa: z.number().optional(),
  uvIndex: z.number().min(0).max(11).optional(),
  solarRadiationWm2: z.number().optional(),
});

export const ingestSoil = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const expectedKey = process.env.IOT_MASTER_SECRET;

    if (
      !apiKey ||
      typeof apiKey !== "string" ||
      !expectedKey ||
      !crypto.timingSafeEqual(
        Buffer.from(apiKey, "utf8"),
        Buffer.from(expectedKey, "utf8"),
      )
    ) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized IoT Device" });
    }

    const data = sensorReadingSchema.parse(req.body);

    if (!data.serialNumber) {
      return res.status(400).json({
        success: false,
        error: "Serial number is required for IoT ingestion",
      });
    }

    const reading = await sensorService.ingestTelemetry({
      serialNumber: data.serialNumber,
      moisturePercent: data.moisturePercent || 0,
      soilTempCelsius: data.temperatureCelsius,
      phLevel: data.phLevel,
      nitrogenPpm: data.nitrogenPpm,
      phosphorusPpm: data.phosphorusPpm,
      potassiumPpm: data.potassiumPpm,
      batteryLevel: data.batteryLevel,
    });

    logger.info(`Soil reading ingested from sensor: ${data.serialNumber}`);

    return res.status(201).json({
      success: true,
      data: {
        id: reading.id,
        receivedAt: reading.readingAt,
        acknowledged: true,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid sensor data",
          details: error.errors,
        },
      });
    }
    return next(error);
  }
};

export const ingestSoilBulk = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const readings = z.array(sensorReadingSchema).parse(req.body);
    const results: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < readings.length; i++) {
      try {
        const data = readings[i];
        const profile = await prisma.farmerProfile.findFirst({
          where: { userId: req.user!.sub },
        });

        if (!profile) {
          errors.push({ index: i, error: "Farmer not found" });
          continue;
        }

        const reading = await prisma.soilReading.create({
          data: {
            farmerId: profile.id,
            moisturePercent: String(data.moisturePercent || 0),
            temperatureCelsius: data.temperatureCelsius
              ? String(data.temperatureCelsius)
              : null,
            phLevel: data.phLevel ? String(data.phLevel) : null,
            readingAt: data.readingAt ? new Date(data.readingAt) : new Date(),
          },
        });

        results.push({ index: i, id: reading.id, success: true });
      } catch (err) {
        errors.push({ index: i, error: "Failed to process" });
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        processed: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const ingestWeather = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const expectedKey = process.env.IOT_MASTER_SECRET;

    if (
      !apiKey ||
      typeof apiKey !== "string" ||
      !expectedKey ||
      !crypto.timingSafeEqual(
        Buffer.from(apiKey, "utf8"),
        Buffer.from(expectedKey, "utf8"),
      )
    ) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized IoT Device" });
    }

    const data = weatherReadingSchema.parse(req.body);

    let farmerId: string | undefined;
    if (req.user?.sub) {
      const profile = await prisma.farmerProfile.findUnique({
        where: { userId: req.user.sub },
      });
      farmerId = profile?.id;
    }

    const reading = await prisma.weatherReading.create({
      data: {
        farmerId: farmerId || "",
        weatherStationId: data.weatherStationId,
        temperatureCelsius: String(data.temperatureCelsius),
        humidityPercent: String(data.humidityPercent),
        rainfallMm: String(data.rainfallMm),
        windSpeedKmh: data.windSpeedKmh ? String(data.windSpeedKmh) : null,
        windDirection: data.windDirection,
        pressureHpa: data.pressureHpa ? String(data.pressureHpa) : null,
        uvIndex: data.uvIndex ? String(data.uvIndex) : null,
        readingAt: new Date(),
      },
    });

    logger.info(
      `Weather reading ingested from station: ${data.weatherStationId || "unknown"}`,
    );

    return res.status(201).json({
      success: true,
      data: {
        id: reading.id,
        receivedAt: reading.readingAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid weather data",
          details: error.errors,
        },
      });
    }
    return next(error);
  }
};

export const updatePumpStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers["x-api-key"];
    const expectedKey = process.env.IOT_MASTER_SECRET;

    if (
      !apiKey ||
      typeof apiKey !== "string" ||
      !expectedKey ||
      !crypto.timingSafeEqual(
        Buffer.from(apiKey, "utf8"),
        Buffer.from(expectedKey, "utf8"),
      )
    ) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized IoT Device" });
    }

    const { pumpId, status, flowRate, pressure } = req.body;

    logger.info(`Pump ${pumpId} status: ${status}`, { flowRate, pressure });

    return res.json({
      success: true,
      data: {
        acknowledged: true,
        pumpId,
        status,
        serverTime: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getStatus = async (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      service: "IoT Ingestion Gateway",
      status: "operational",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
      endpoints: [
        "POST /sensors/ingest/soil - Submit soil sensor reading",
        "POST /sensors/ingest/soil/bulk - Bulk upload readings",
        "POST /sensors/ingest/weather - Submit weather station reading",
        "POST /sensors/ingest/pump/status - Report pump status",
        "GET /sensors/ingest/status - Service health check",
      ],
    },
  });
};
