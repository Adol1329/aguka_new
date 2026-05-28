import { Request, Response, NextFunction } from "express";
import { sensorEngine } from "../simulation/sensor-engine.js";
import { irrigationLogic } from "../simulation/irrigation-logic.js";
import { prisma } from "../prisma.js";
import { RequestWithUser } from "../types/index.js";

/**
 * Standardized simulation controller
 */
export const startSimulation = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId, weatherPattern, soilType, cropType } = req.body;

    await sensorEngine.startSimulation({
      farmId: farmId || req.user!.sub,
      updateInterval: 60000, // 1 minute
      weatherPattern: weatherPattern || "mixed",
      soilType: soilType || "loamy",
      cropType: cropType || "maize",
      irrigationSystem: true,
    });

    return res.json({ success: true, message: "Simulation started" });
  } catch (error) {
    return next(error);
  }
};

export const stopSimulation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId } = req.params;
    await sensorEngine.stopSimulation(farmId);
    return res.json({ success: true, message: "Simulation stopped" });
  } catch (error) {
    return next(error);
  }
};

export const getSimulationStatus = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = sensorEngine.getSimulationStatus();
    return res.json({ success: true, data: status });
  } catch (error) {
    return next(error);
  }
};

export const getSimulationConfig = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { farmId } = req.params;
    const config = sensorEngine.getSimulationConfig(farmId);
    return res.json({ success: true, data: config });
  } catch (error) {
    return next(error);
  }
};

export const stopAllSimulations = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    await sensorEngine.stopAllSimulations();
    return res.json({ success: true, message: "All simulations stopped" });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET Standardized Simulated Data
 * Replaces hardcoded UI values with structured backend simulation
 */
export const getSimulatedData = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const farmId = req.params.farmId || req.user!.sub;

    // 1. Get latest reading from DB (which SensorEngine populates)
    const farmer = await prisma.farmerProfile.findFirst({
      where: { userId: farmId },
      include: {
        soilReadings: { orderBy: { readingAt: "desc" }, take: 1 },
        weatherReadings: { orderBy: { readingAt: "desc" }, take: 1 },
      },
    });

    if (!farmer || farmer.soilReadings.length === 0) {
      // If no simulation running, return a default structured simulation frame
      return res.json({
        success: true,
        source: "simulation",
        data: {
          soilMoisture: 45.5,
          temperature: 22.8,
          ph: 6.5,
          npk: { n: 80, p: 40, k: 150 },
          weather: {
            tempC: 24,
            humidity: 60,
            rainfall: 0,
            condition: "Cloudy",
          },
          timestamp: new Date().toISOString(),
        },
      });
    }

    const soil = farmer.soilReadings[0];
    const weather = farmer.weatherReadings[0];

    return res.json({
      success: true,
      source: "simulation",
      data: {
        soilMoisture: Number(soil.moisturePercent),
        temperature: Number(soil.temperatureCelsius),
        ph: Number(soil.phLevel),
        npk: {
          n: Number(soil.nitrogenPpm),
          p: Number(soil.phosphorusPpm),
          k: Number(soil.potassiumPpm),
        },
        weather: {
          tempC: Number(weather?.temperatureCelsius || 22),
          humidity: Number(weather?.humidityPercent || 55),
          rainfall: Number(weather?.rainfallMm || 0),
          condition: Number(weather?.rainfallMm || 0) > 0 ? "Rainy" : "Clear",
        },
        timestamp: soil.readingAt.toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// Irrigation stubs (standardized)
export const getIrrigationStatus = async (
  _req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const status = irrigationLogic.getStatus();
    return res.json({ success: true, source: "simulation", data: status });
  } catch (error) {
    return next(error);
  }
};

export const getIrrigationRules = async (
  _req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rules = irrigationLogic.getRules();
    return res.json({ success: true, data: rules });
  } catch (error) {
    return next(error);
  }
};

export const addIrrigationRule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    irrigationLogic.addRule(req.body);
    return res.status(201).json({ success: true, message: "Rule added" });
  } catch (error) {
    return next(error);
  }
};

export const removeIrrigationRule = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    irrigationLogic.removeRule(req.params.ruleId);
    return res.json({ success: true, message: "Rule removed" });
  } catch (error) {
    return next(error);
  }
};

export const toggleAutomation = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    irrigationLogic.setAutomation(req.body.enabled);
    return res.json({
      success: true,
      message: `Automation ${req.body.enabled ? "enabled" : "disabled"}`,
    });
  } catch (error) {
    return next(error);
  }
};

export const manualIrrigationControl = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { action } = req.body;
    // Manual control requires zoneId, action, and reason. Using first zone as default for simulation.
    irrigationLogic.manualControl("zone_1", action, "Manual trigger from API");
    return res.json({
      success: true,
      message: `Irrigation ${action} command sent`,
    });
  } catch (error) {
    return next(error);
  }
};

export const triggerSimulatedAlert = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type, farmerId, district, sector } = req.body;
    const { alertSimulator } = await import("../simulation/alert-simulator.js");

    let result;
    switch (type) {
      case "drought":
        result = await alertSimulator.simulateDistrictDrought(
          district || "Musanze",
        );
        break;
      case "nutrient":
        result = await alertSimulator.simulateNutrientDeficiency(farmerId);
        break;
      case "pest":
        result = await alertSimulator.simulatePestOutbreak(sector || "Remera");
        break;
      default:
        return res
          .status(400)
          .json({ success: false, error: "Invalid alert type" });
    }

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};
