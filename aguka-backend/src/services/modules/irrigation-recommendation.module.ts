import { BaseRecommendationService, Recommendation } from "../recommendation.service.js";
import { prisma } from "../../prisma.js";
import { soilService } from "../soil.service.js";
import { weatherService } from "../weather.service.js";
import { logger } from "../../utils/logger.js";

/**
 * Irrigation recommendation module - extends the base recommendation service
 * Demonstrates integration with rule configuration system
 */
export class IrrigationRecommendationModule extends BaseRecommendationService {
  protected readonly recommendationType = "irrigation";
  
  /**
   * Generate irrigation recommendations based on soil, weather, and crop data
   * @param farmerId The farmer's user ID
   * @returns Promise resolving to an irrigation recommendation or null
   */
  public async generateRecommendations(farmerId: string): Promise<Recommendation | null> {
    try {
      // Check if we should generate a new recommendation or return a cached one
      const shouldGenerate = await this.shouldGenerateNewRecommendation(farmerId);
      
      if (!shouldGenerate) {
        const recentRecs = await this.getRecentRecommendations(farmerId, 1);
        if (recentRecs.length > 0) {
          return recentRecs[0];
        }
      }
      
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
        const recommendation: Recommendation = {
          farmerId,
          type: this.recommendationType,
          title: "No Active Crop",
          message: "Please set up your farm profile first to receive irrigation recommendations.",
          recommendation: "No active crop found. Please set up your farm profile first.",
          confidence: "low",
          priority: 1,
          actionRequired: false,
          details: {
            soilMoisture: soilStatus.moisture,
            forecast: forecast.slice(0, 3),
            crop: null
          }
        };
        
        return await this.saveRecommendation(recommendation);
      }

      const crop = activeCrop.crop;
      
      // Calculate irrigation need
      const irrigationNeed = this.calculateIrrigationNeed(
        soilStatus,
        forecast.slice(0, 3), // 3-day forecast as specified
        crop
      );
      
      // Create full recommendation object
      const recommendation: Recommendation = {
        farmerId,
        type: this.recommendationType,
        title: irrigationNeed.type === "info" ? "Irrigation Update" : "Irrigation Needed",
        message: irrigationNeed.recommendation,
        recommendation: irrigationNeed.recommendation,
        confidence: irrigationNeed.confidence as 'low' | 'medium' | 'high',
        priority: irrigationNeed.confidence === 'high' ? 4 : irrigationNeed.confidence === 'medium' ? 3 : 2,
        actionRequired: irrigationNeed.actionRequired,
        details: {
          soilMoisture: irrigationNeed.details?.soilMoisture,
          expectedRainfall3Day: irrigationNeed.details?.expectedRainfall3Day,
          cropWaterNeed3Day: irrigationNeed.details?.cropWaterNeed3Day,
          waterBalance: irrigationNeed.details?.waterBalance,
          waterDeficit: irrigationNeed.details?.waterDeficit,
          irrigationAmount: irrigationNeed.details?.irrigationAmount,
          durationMinutes: irrigationNeed.details?.durationMinutes,
          bestDay: irrigationNeed.details?.bestDay,
          crop: irrigationNeed.details?.crop,
          forecast: irrigationNeed.details?.forecast
        }
      };
      
      // Save and return the recommendation
      return await this.saveRecommendation(recommendation);
    } catch (error) {
      logger.error("Error generating irrigation recommendations:", error);
      
      // Fallback response
      const fallbackRecommendation: Recommendation = {
        farmerId,
        type: this.recommendationType,
        title: "Recommendation Error",
        message: "Unable to generate recommendation at this time.",
        recommendation: "Unable to generate recommendation at this time. Please check your soil and weather data connections.",
        confidence: "low",
        priority: 1,
        actionRequired: false,
        details: {
          error: error instanceof Error ? error.message : String(error)
        }
      };
      
      return await this.saveRecommendation(fallbackRecommendation);
    }
  }
  
  /**
   * Calculate irrigation need based on soil, weather, and crop data
   * (Same logic as before, but now returns structured data)
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
}

// Export singleton instance
export const irrigationRecommendationModule = new IrrigationRecommendationModule();