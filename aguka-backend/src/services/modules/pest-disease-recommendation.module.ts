import { BaseRecommendationService, Recommendation } from "../recommendation.service.js";
import { prisma } from "../../prisma.js";
import { weatherService } from "../weather.service.js";
import { logger } from "../../utils/logger.js";

/**
 * Pest/disease recommendation module - extends the base recommendation service
 */
export class PestDiseaseRecommendationModule extends BaseRecommendationService {
  protected readonly recommendationType = "pest-disease";
  
  /**
   * Generate pest/disease recommendations based on weather conditions and crop stage
   * @param farmerId The farmer's user ID
   * @returns Promise resolving to a pest/disease recommendation or null
   */
  public async generateRecommendations(farmerId: string): Promise<Recommendation | null> {
    try {
      // Check if we should generate a new recommendation or return a cached one
      const shouldGenerate = await this.shouldGenerateNewRecommendation(farmerId, 6); // 6 hours for pest recommendations
      
      if (!shouldGenerate) {
        const recentRecs = await this.getRecentRecommendations(farmerId, 1);
        if (recentRecs.length > 0) {
          return recentRecs[0];
        }
      }
      
      // Get farmer's active crops
      const activeCrops = await prisma.farmerCrop.findMany({
        where: {
          farmerId,
          status: "planted",
        },
        include: { crop: true },
      });

      if (activeCrops.length === 0) {
        const recommendation: Recommendation = {
          farmerId,
          type: this.recommendationType,
          title: "No Active Crops",
          message: "Please set up your farm profile first to receive pest/disease recommendations.",
          recommendation: "No active crops found. Please set up your farm profile first.",
          confidence: "low",
          priority: 1,
          actionRequired: false,
          details: {
            crops: [],
            weatherConditions: null
          }
        };
        
        return await this.saveRecommendation(recommendation);
      }

      // Get current weather conditions
      const weather = await weatherService.getCurrentWeather(farmerId);
      
      // Analyze pest/disease risk based on weather and crop types
      const riskAnalysis = this.analyzePestDiseaseRisk(activeCrops, weather);
      
      // Create recommendation based on analysis
      const recommendation: Recommendation = {
        farmerId,
        type: this.recommendationType,
        title: riskAnalysis.title,
        message: riskAnalysis.message,
        recommendation: riskAnalysis.recommendation,
        confidence: riskAnalysis.confidence as 'low' | 'medium' | 'high',
        priority: riskAnalysis.priority,
        actionRequired: riskAnalysis.actionRequired,
        details: {
          crops: activeCrops.map(crop => ({
            id: crop.id,
            name: crop.crop.nameEn,
            plantedDate: crop.plantedDate,
            growthStage: this.calculateGrowthStage(crop.plantedDate, crop.crop.growingPeriodDays || 90)
          })),
          weatherConditions: {
            temperature: weather.temperatureCelsius,
            humidity: weather.humidityPercent,
            rainfall: weather.rainfallMm
          },
          riskFactors: riskAnalysis.riskFactors
        }
      };
      
      // Save and return the recommendation
      return await this.saveRecommendation(recommendation);
    } catch (error) {
      logger.error("Error generating pest/disease recommendations:", error);
      
      // Fallback response
      const fallbackRecommendation: Recommendation = {
        farmerId,
        type: this.recommendationType,
        title: "Recommendation Error",
        message: "Unable to generate pest/disease recommendation at this time.",
        recommendation: "Unable to generate pest/disease recommendation at this time. Please check your weather data connections.",
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
   * Analyze pest/disease risk based on weather conditions and crop types
   */
  private analyzePestDiseaseRisk(activeCrops: any[], weather: any) {
    // Simple rule-based analysis for demonstration
    const temp = weather.temperatureCelsius ?? 20;
    const humidity = weather.humidityPercent ?? 60;
    const rainfall = weather.rainfallMm ?? 0;
    
    let riskLevel = "low";
    let riskFactors: string[] = [];
    let title = "Pest/Disease Risk Assessment";
    let message = "Current conditions present low risk for pest and disease development.";
    let recommendation = "Continue regular field monitoring. No immediate action required.";
    let priority = 1;
    let actionRequired = false;
    let confidence: 'low' | 'medium' | 'high' = 'medium';
    
    // High humidity and warm temperatures increase fungal disease risk
    if (humidity > 80 && temp > 20) {
      riskLevel = "high";
      riskFactors.push("High humidity and warm temperatures favor fungal diseases");
      title = "High Fungal Disease Risk";
      message = "Conditions are favorable for fungal disease development.";
      recommendation = "Increase field scouting frequency. Consider preventive fungicide application if history of disease.";
      priority = 4;
      actionRequired = true;
      confidence = 'high';
    } 
    // Moderate humidity and warm temperatures
    else if (humidity > 60 && temp > 18) {
      riskLevel = "medium";
      riskFactors.push("Moderate humidity and temperature conditions");
      title = "Moderate Pest/Disease Risk";
      message = "Conditions may support pest and disease development.";
      recommendation = "Regular field scouting recommended. Monitor for early signs of infestation.";
      priority = 3;
      actionRequired = false;
      confidence = 'medium';
    }
    // Dry conditions might increase certain pests
    else if (rainfall < 5 && temp > 25) {
      riskLevel = "medium";
      riskFactors.push("Dry and warm conditions may favor certain insect pests");
      title = "Potential Insect Pest Risk";
      message = "Dry conditions may increase activity of certain insect pests.";
      recommendation = "Monitor for insect pests, especially in dry areas of the field.";
      priority = 2;
      actionRequired = false;
      confidence = 'medium';
    }
    
    // Check for specific crop vulnerabilities
    const vulnerableCrops = activeCrops.filter(crop => {
      const cropName = crop.crop.nameEn?.toLowerCase() || '';
      // Examples of crop-specific vulnerabilities
      return cropName.includes('maize') || cropName.includes('tomato') || cropName.includes('potato');
    });
    
    if (vulnerableCrops.length > 0 && riskLevel !== "low") {
      riskFactors.push(`Vulnerable crops detected: ${vulnerableCrops.map(c => c.crop.nameEn).join(', ')}`);
      // Increase priority for vulnerable crops
      priority = Math.min(5, priority + 1);
    }
    
    return {
      title,
      message,
      recommendation,
      confidence,
      priority,
      actionRequired,
      riskFactors
    };
  }
  
  /**
   * Calculate growth stage based on planting date and total growing period
   */
  private calculateGrowthStage(plantedDate: Date, totalGrowingPeriodDays: number): string {
    const daysSincePlanting = Math.floor((Date.now() - plantedDate.getTime()) / (1000 * 60 * 60 * 24));
    const progressPercentage = (daysSincePlanting / totalGrowingPeriodDays) * 100;
    
    if (progressPercentage < 25) return "Early";
    if (progressPercentage < 50) return "Vegetative";
    if (progressPercentage < 75) return "Flowering";
    return "Maturity/Ripening";
  }
}

// Export singleton instance
export const pestDiseaseRecommendationModule = new PestDiseaseRecommendationModule();