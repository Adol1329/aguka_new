import { BaseRecommendationService, Recommendation } from "../recommendation.service.js";
import { prisma } from "../../prisma.js";
import { soilService } from "../soil.service.js";
import { logger } from "../../utils/logger.js";

/**
 * Fertilizer recommendation module - extends the base recommendation service
 */
export class FertilizerRecommendationModule extends BaseRecommendationService {
  protected readonly recommendationType = "fertilizer";
  
  /**
   * Generate fertilizer recommendations based on soil nutrient levels and crop requirements
   * @param farmerId The farmer's user ID
   * @returns Promise resolving to a fertilizer recommendation or null
   */
  public async generateRecommendations(farmerId: string): Promise<Recommendation | null> {
    try {
      // Check if we should generate a new recommendation or return a cached one
      const shouldGenerate = await this.shouldGenerateNewRecommendation(farmerId, 12); // 12 hours for fertilizer recommendations
      
      if (!shouldGenerate) {
        const recentRecs = await this.getRecentRecommendations(farmerId, 1);
        if (recentRecs.length > 0) {
          return recentRecs[0];
        }
      }
      
      // Get current soil status
      const soilStatus = await soilService.getCurrentStatus(farmerId);
      
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
          message: "Please set up your farm profile first to receive fertilizer recommendations.",
          recommendation: "No active crops found. Please set up your farm profile first.",
          confidence: "low",
          priority: 1,
          actionRequired: false,
          details: {
            crops: [],
            soilNutrients: soilStatus
          }
        };
        
        return await this.saveRecommendation(recommendation);
      }

      // Analyze fertilizer needs based on soil nutrients and crop requirements
      const fertilizerAnalysis = this.analyzeFertilizerNeeds(activeCrops, soilStatus);
      
      // Create recommendation based on analysis
      const recommendation: Recommendation = {
        farmerId,
        type: this.recommendationType,
        title: fertilizerAnalysis.title,
        message: fertilizerAnalysis.message,
        recommendation: fertilizerAnalysis.recommendation,
        confidence: fertilizerAnalysis.confidence as 'low' | 'medium' | 'high',
        priority: fertilizerAnalysis.priority,
        actionRequired: fertilizerAnalysis.actionRequired,
        details: {
          crops: activeCrops.map(crop => ({
            id: crop.id,
            name: crop.crop.nameEn,
            plantedDate: crop.plantedDate,
            nitrogenReq: crop.crop.nitrogenRequirementKgha,
            phosphorusReq: crop.crop.phosphorusRequirementKgha,
            potassiumReq: crop.crop.potassiumRequirementKgha
          })),
           soilNutrients: {
             nitrogen: soilStatus.nitrogen,
             phosphorus: soilStatus.phosphorus,
             potassium: soilStatus.potassium,
             ph: soilStatus.ph
           },
          recommendations: fertilizerAnalysis.specificRecommendations
        }
      };
      
      // Save and return the recommendation
      return await this.saveRecommendation(recommendation);
    } catch (error) {
      logger.error("Error generating fertilizer recommendations:", error);
      
      // Fallback response
      const fallbackRecommendation: Recommendation = {
        farmerId,
        type: this.recommendationType,
        title: "Recommendation Error",
        message: "Unable to generate fertilizer recommendation at this time.",
        recommendation: "Unable to generate fertilizer recommendation at this time. Please check your soil data connections.",
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
   * Analyze fertilizer needs based on soil nutrients and crop requirements
   */
  private analyzeFertilizerNeeds(activeCrops: any[], soilStatus: any) {
    // Get average crop requirements
    const avgNitrogenReq = activeCrops.reduce((sum, crop) => {
      return sum + (Number(crop.crop.nitrogenRequirementKgha) || 0);
    }, 0) / activeCrops.length;
    
    const avgPhosphorusReq = activeCrops.reduce((sum, crop) => {
      return sum + (Number(crop.crop.phosphorusRequirementKgha) || 0);
    }, 0) / activeCrops.length;
    
    const avgPotassiumReq = activeCrops.reduce((sum, crop) => {
      return sum + (Number(crop.crop.potassiumRequirementKgha) || 0);
    }, 0) / activeCrops.length;
    
    // Current soil nutrient levels (convert from ppm to kg/ha for comparison - rough approximation)
    const soilNitrogen = soilStatus.nitrogenPpm ?? 0;
    const soilPhosphorus = soilStatus.phosphorusPpm ?? 0;
    const soilPotassium = soilStatus.potassiumPpm ?? 0;
    const soilPh = soilStatus.phLevel ?? 6.5;
    
    // Simple deficiency assessment (this would be more sophisticated in practice)
    const nDeficit = Math.max(0, avgNitrogenReq - (soilNitrogen * 0.1)); // Rough conversion
    const pDeficit = Math.max(0, avgPhosphorusReq - (soilPhosphorus * 0.1));
    const kDeficit = Math.max(0, avgPotassiumReq - (soilPotassium * 0.1));
    
    let priority = 1;
    let actionRequired = false;
    let confidence: 'low' | 'medium' | 'high' = 'medium';
    let title = "Fertilizer Recommendation";
    let message = "Soil nutrient levels appear adequate for current crops.";
    let recommendation = "No fertilizer application needed at this time based on current soil tests.";
    let specificRecommendations: string[] = [];
    
    // Check for significant deficiencies
    const totalDeficit = nDeficit + pDeficit + kDeficit;
    
    if (totalDeficit > 30) { // Significant deficiency threshold
      priority = 4;
      actionRequired = true;
      confidence = 'high';
      title = "Fertilizer Application Recommended";
      message = "Soil tests indicate nutrient deficiencies that may affect crop performance.";
      recommendation = "Consider applying fertilizer to address nutrient deficiencies.";
      
      if (nDeficit > 15) {
        specificRecommendations.push(`Apply nitrogen fertilizer at ${Math.round(nDeficit)} kg/ha`);
      }
      if (pDeficit > 10) {
        specificRecommendations.push(`Apply phosphorus fertilizer at ${Math.round(pDeficit)} kg/ha`);
      }
      if (kDeficit > 10) {
        specificRecommendations.push(`Apply potassium fertilizer at ${Math.round(kDeficit)} kg/ha`);
      }
      
      // pH adjustment recommendations
      if (soilPh < 5.5) {
        specificRecommendations.push("Consider applying lime to raise soil pH");
      } else if (soilPh > 7.5) {
        specificRecommendations.push("Consider applying sulfur to lower soil pH");
      }
    } else if (totalDeficit > 10) { // Moderate deficiency
      priority = 3;
      actionRequired = false;
      confidence = 'medium';
      title = "Monitor Nutrient Levels";
      message = "Soil tests show minor nutrient deficiencies. Monitor crops for signs of deficiency.";
      recommendation = "Consider soil retesting in 4-6 weeks. No immediate fertilizer application needed.";
      
      if (nDeficit > 5) {
        specificRecommendations.push("Monitor for nitrogen deficiency symptoms");
      }
      if (pDeficit > 3) {
        specificRecommendations.push("Monitor for phosphorus deficiency symptoms");
      }
      if (kDeficit > 3) {
        specificRecommendations.push("Monitor for potassium deficiency symptoms");
      }
    }
    
    return {
      title,
      message,
      recommendation,
      confidence,
      priority,
      actionRequired,
      specificRecommendations
    };
  }
}

// Export singleton instance
export const fertilizerRecommendationModule = new FertilizerRecommendationModule();