import { prisma } from "../prisma.js";
import { soilService } from "./soil.service.js";
import { weatherService } from "./weather.service.js";
import { logger } from "../utils/logger.js";

export class IrrigationRecommendationService {
  /**
   * Generate irrigation recommendations based on soil, weather, and crop data
   */
  async generateRecommendations(farmerId: string) {
    try {
      // Get current soil status
      const soilStatus = await soilService.getCurrentStatus(farmerId);
      
      // Get weather forecast (3-day as specified in requirements)
      const forecast = await weatherService.getForecast(farmerId);
      
      // Get farmer's active crop
      const activeCrop = await prisma.farmerCrop.findFirst({
        where: {
          farmerId,
          status: "planted",
        },
        include: { crop: true },
      });

      if (!activeCrop) {
        return {
          recommendation: "No active crop found. Please set up your farm profile first.",
          type: "info",
          confidence: "low",
          actionRequired: false,
          details: {
            soilMoisture: soilStatus.moisture,
            forecast: forecast.slice(0, 3),
            crop: null
          }
        };
      }

      const crop = activeCrop.crop;
      
      // Calculate irrigation need
      const irrigationNeed = this.calculateIrrigationNeed(
        soilStatus,
        forecast.slice(0, 3), // 3-day forecast as specified
        crop
      );

      return irrigationNeed;
    } catch (error) {
      logger.error("Error generating irrigation recommendations:", error);
      
      // Fallback response
      return {
        recommendation: "Unable to generate recommendation at this time. Please check your soil and weather data connections.",
        type: "error",
        confidence: "low",
        actionRequired: false,
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
    }
  }

  /**
   * Calculate irrigation need based on soil, weather, and crop data
   */
  private calculateIrrigationNeed(
    soilStatus: any,
    forecast: any[],
    crop: any
  ) {
    const soilMoisture = soilStatus.moisture ?? 0;
    const cropWaterNeedMm = Number(crop.waterRequirementMm) || 5; 
    const rootDepthCm = crop.rootDepthCm || 30; 
    
    // Get soil-specific water capacity
    const soilAvailableWaterCapacity = this.getSoilAvailableWaterCapacity(crop.farmerCrops?.[0]?.farmer?.soilType);
    
    // Calculate current available water in root zone (mm)
    const currentAvailableWater = soilMoisture * soilAvailableWaterCapacity * rootDepthCm;
    
    // Calculate expected water loss over next 3 days
    let expectedET0 = 0; // Reference evapotranspiration
    let expectedRainfall = 0;
    
    forecast.forEach(day => {
      // Estimate ET0 from temperature (simplified Hamon method)
      const tempAvg = ((day.tempMin ?? 20) + (day.tempMax ?? 25)) / 2;
      const et0Day = 0.165 * (tempAvg / 100) * Math.pow((100 - tempAvg) / tempAvg, 2) * 24; // mm/day
      expectedET0 += Math.max(0, et0Day);
      
      expectedRainfall += day.rainfallMm ?? 0;
    });
    
    // Calculate crop water need over 3 days
    const cropCoefficient = Number(crop.cropCoefficient) || 0.8; // Kc
    const cropWaterNeed3Day = cropWaterNeedMm * cropCoefficient * 3;
    
    // Calculate net water deficit
    const waterDeficit = cropWaterNeed3Day - expectedRainfall;
    
    // Calculate current water availability vs needed
    const waterAvailableForCrop = currentAvailableWater;
    const waterNeeded = Math.max(0, waterDeficit);
    
    // Determine recommendation
    if (waterAvailableForCrop >= waterNeeded * 1.2) { // 20% buffer
      // Sufficient water available
      return {
        recommendation: "No irrigation needed in the next 3 days. Soil moisture is sufficient for crop needs.",
        type: "info",
        confidence: "high",
        actionRequired: false,
        details: {
          soilMoisture: `${soilMoisture.toFixed(1)}%`,
          expectedRainfall3Day: `${expectedRainfall.toFixed(1)}mm`,
          cropWaterNeed3Day: `${cropWaterNeed3Day.toFixed(1)}mm`,
          waterBalance: `${(waterAvailableForCrop - waterNeeded).toFixed(1)}mm surplus`,
          crop: crop.nameEn,
          forecast: forecast.slice(0, 3)
        }
      };
    } else {
      // Need irrigation
      const irrigationAmount = Math.max(0, waterNeeded - waterAvailableForCrop);
      
      // Calculate optimal timing (avoid windy/hot periods)
      const bestDay = this.findBestIrrigationDay(forecast);
      const bestTime = "06:00"; // Early morning optimal (can be refined)
      
      // Convert water amount to time based on flow rate (assume 2mm/min for drip)
      const flowRateMmPerMin = 2; 
      const durationMinutes = Math.ceil(irrigationAmount / flowRateMmPerMin);
      
      return {
        recommendation: `Irrigate ${durationMinutes} min on ${bestDay.date} at ${bestTime}`,
        type: "warning",
        confidence: "medium",
        actionRequired: true,
        details: {
          soilMoisture: `${soilMoisture.toFixed(1)}%`,
          expectedRainfall3Day: `${expectedRainfall.toFixed(1)}mm`,
          cropWaterNeed3Day: `${cropWaterNeed3Day.toFixed(1)}mm`,
          waterDeficit: `${waterNeeded.toFixed(1)}mm`,
          irrigationAmount: `${irrigationAmount.toFixed(1)}mm`,
          durationMinutes: `${durationMinutes} min`,
          bestDay: bestDay,
          crop: crop.nameEn,
          forecast: forecast.slice(0, 3)
        }
      };
    }
  }

  /**
   * Get soil-specific water capacity based on soil type
   * Values represent mm of available water per cm of soil depth per 1% moisture
   */
  private getSoilAvailableWaterCapacity(soilType?: string): number {
    const soilMap: Record<string, number> = {
      'volcanic': 2.0, // High retention (e.g., Musanze)
      'loam': 1.5,     // Standard
      'sandy': 0.8,    // Low retention (e.g., Bugesera)
      'clay': 1.8,     // High retention
      'silt': 1.6,
    };

    if (!soilType) return 1.5;
    
    const normalizedType = soilType.toLowerCase();
    for (const [key, value] of Object.entries(soilMap)) {
      if (normalizedType.includes(key)) return value;
    }
    
    return 1.5; // Default to loam-like behavior
  }

  /**
   * Find the best day for irrigation based on forecast (avoid rain, high wind, high heat)
   */
  private findBestIrrigationDay(forecast: any[]) {
    // Score each day (lower is better for irrigation)
    const scoredDays = forecast.map((day, index) => {
      let score = 0;
      
      // Prefer days with less rain
      score += (day.rainfallMm ?? 0) * 2; 
      
      // Prefer cooler days (less evaporation)
      const tempAvg = ((day.tempMin ?? 20) + (day.tempMax ?? 25)) / 2;
      score += Math.max(0, (tempAvg - 20) * 0.5); 
      
      // Prefer earlier days in forecast
      score += index * 0.1;
      
      return {
        ...day,
        score,
        date: new Date(day.forecastDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      };
    });
    
    // Return day with lowest score
    return scoredDays.reduce((best, current) => 
      current.score < best.score ? current : best
    );
  }

  /**
   * Accept a recommendation and create an irrigation schedule
   */
  async acceptRecommendation(farmerId: string, recommendationData: any) {
    try {
      // Get farmer profile
      const profile = await prisma.farmerProfile.findUnique({
        where: { userId: farmerId },
      });

      if (!profile) {
        throw new Error("Farmer profile not found");
      }

      // Get active crop for zone association
      const activeCrop = await prisma.farmerCrop.findFirst({
        where: {
          farmerId,
          status: "planted",
        },
        include: { crop: true },
      });

      // Parse recommendation to extract duration and timing
      const { durationMinutes, scheduledFor } = this.parseRecommendation(
        recommendationData.recommendation
      );

      // Create irrigation schedule
      const schedule = await prisma.irrigationSchedule.create({
        data: {
          farmerId: profile.id,
          cropId: activeCrop?.cropId,
          scheduleType: "scheduled",
          startTime: scheduledFor || "06:00", 
          durationMinutes: durationMinutes || 20,
          frequency: "once",
          daysOfWeek: [],
          waterAmountLiters: (durationMinutes || 20) * 2, // Assume 2L/min flow rate
          pumpEnabled: true,
          valveEnabled: true,
          isActive: true,
        },
      });

      // Log the action
      // await auditService.logWithSnapshot({
      //   userId: farmerId,
      //   action: "ACCEPT_IRRIGATION_RECOMMENDATION",
      //   module: "IRRIGATION",
      //   resourceId: schedule.id,
      //   after: schedule,
      // });

      return {
        success: true,
        schedule,
        message: "Irrigation schedule created from recommendation"
      };
    } catch (error) {
      logger.error("Error accepting irrigation recommendation:", error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Parse recommendation string to extract duration and timing
   */
  private parseRecommendation(recommendation: string) {
    const durationMatch = recommendation.match(/(\d+)\s*min/);
    const durationMinutes = durationMatch ? parseInt(durationMatch[1], 10) : 20;
    
    // Extract day/time if present
    let scheduledFor = null;
    const timeMatch = recommendation.match(/at\s+(\d{1,2}:\d{2})/i);
    if (timeMatch) {
      scheduledFor = timeMatch[1];
    }
    
    return { durationMinutes, scheduledFor };
  }
}

export const irrigationRecommendationService = new IrrigationRecommendationService();