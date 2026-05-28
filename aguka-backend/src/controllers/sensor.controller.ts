import { Request, Response, NextFunction } from "express";
import { sensorService } from "../services/sensor.service.js";

export const ingestTelemetry = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey || apiKey !== process.env.IOT_MASTER_SECRET) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized IoT Device" });
    }

    const reading = await sensorService.ingestTelemetry(req.body);

    return res.status(201).json({
      success: true,
      message: "Telemetry ingested successfully",
      data: { id: reading.id },
    });
  } catch (error: any) {
    return next(error);
  }
};
