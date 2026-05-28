import { Response, NextFunction } from "express";
import { irrigationRecommendationModule } from "../services/modules/irrigation-recommendation.module.js";
import { pestDiseaseRecommendationModule } from "../services/modules/pest-disease-recommendation.module.js";
import { fertilizerRecommendationModule } from "../services/modules/fertilizer-recommendation.module.js";
import { BaseRecommendationService } from "../services/recommendation.service.js";
import { RequestWithUser } from "../types/index.js";
import { prisma } from "../prisma.js";

/**
 * Controller for handling recommendation requests
 */
export class RecommendationController {
  private readonly services: Map<string, BaseRecommendationService>;
  
  constructor() {
    this.services = new Map();
    // Register available recommendation services
    this.services.set('irrigation', irrigationRecommendationModule);
    this.services.set('pest-disease', pestDiseaseRecommendationModule);
    this.services.set('fertilizer', fertilizerRecommendationModule);
    // Additional services will be added here as they're implemented
  }
  
  /**
   * Get recommendations for a farmer
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async getRecommendations(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const farmerId = req.user!.sub;
      const type = req.query.type as string || undefined;
      
      let recommendations: any[] = [];
      
      if (type) {
        // Get specific type of recommendation
        const service = this.services.get(type);
        if (!service) {
          return res.status(400).json({ 
            success: false, 
            message: `Unsupported recommendation type: ${type}` 
          });
        }
        
        const recommendation = await service.generateRecommendations(farmerId);
        if (recommendation) {
          recommendations.push(recommendation);
        }
      } else {
        // Get all recommendation types
        for (const [type, service] of this.services.entries()) {
          try {
            const recommendation = await service.generateRecommendations(farmerId);
            if (recommendation) {
              recommendations.push(recommendation);
            }
          } catch (serviceError) {
            // Log error but continue with other services
            console.error(`Error generating ${type} recommendation:`, serviceError);
          }
        }
      }
      
      return res.json({ 
        success: true, 
        data: recommendations,
        count: recommendations.length
      });
    } catch (error) {
      return next(error);
    }
  }
  
  /**
   * Accept a recommendation
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async acceptRecommendation(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const farmerId = req.user!.sub;
      const { type, recommendationId } = req.body;
      
      if (!type || !recommendationId) {
        return res.status(400).json({ 
          success: false, 
          message: "Recommendation type and ID are required" 
        });
      }
      
      const service = this.services.get(type);
      if (!service) {
        return res.status(400).json({ 
          success: false, 
          message: `Unsupported recommendation type: ${type}` 
        });
      }
      
      // For now, only irrigation recommendations have acceptance logic
      // Other types can implement their own acceptance handlers
      if (type === 'irrigation' && 'acceptRecommendation' in service) {
        // @ts-ignore - We know this method exists for irrigation service
        const result = await service.acceptRecommendation(farmerId, { 
          recommendationId,
          ...req.body 
        });
        
        return res.json({ 
          success: true, 
          data: result 
        });
      }
      
      // For other types, just mark as read in database
      await prisma.recommendation.updateMany({
        where: {
          id: recommendationId,
          farmerId,
          type
        },
        data: {
          isRead: true
        }
      });
      
      return res.json({ 
        success: true, 
        message: "Recommendation marked as accepted" 
      });
    } catch (error) {
      return next(error);
    }
  }
  
  /**
   * Dismiss a recommendation
   * @param req Express request object
   * @param res Express response object
   * @param next Express next function
   */
  public async dismissRecommendation(
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const farmerId = req.user!.sub;
      const { type, recommendationId } = req.body;
      
      if (!type || !recommendationId) {
        return res.status(400).json({ 
          success: false, 
          message: "Recommendation type and ID are required" 
        });
      }
      
      // Mark recommendation as dismissed (we'll add a field for this later)
      // For now, just mark as read
      await prisma.recommendation.updateMany({
        where: {
          id: recommendationId,
          farmerId,
          type
        },
        data: {
          isRead: true
        }
      });
      
      return res.json({ 
        success: true, 
        message: "Recommendation dismissed" 
      });
    } catch (error) {
      return next(error);
    }
  }
}

// Export singleton instance
export const recommendationController = new RecommendationController();