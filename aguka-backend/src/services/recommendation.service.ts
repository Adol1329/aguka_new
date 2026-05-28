import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

function toDetailsRecord(
  value: Prisma.JsonValue | null | undefined,
): Record<string, unknown> | undefined {
  if (value == null) return undefined;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return undefined;
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return undefined;
}

/**
 * Base interface for all recommendation types
 */
export interface Recommendation {
  id?: string;
  farmerId: string;
  type: string;
  title: string;
  message: string;
  recommendation: string;
  confidence: 'low' | 'medium' | 'high';
  priority: number; // 1-5 scale
  actionRequired: boolean;
  details?: Record<string, unknown>;
  generatedAt?: Date;
  expiresAt?: Date;
}

/**
 * Base class for recommendation generators
 */
export abstract class BaseRecommendationService {
  protected abstract readonly recommendationType: string;
  
  /**
   * Generate recommendations for a farmer
   * @param farmerId The farmer's user ID
   * @returns Promise resolving to a recommendation or null if none could be generated
   */
  public abstract generateRecommendations(farmerId: string): Promise<Recommendation | null>;
  
  /**
   * Save a recommendation to the database
   * @param recommendation The recommendation to save
   * @returns Promise resolving to the saved recommendation
   */
  protected async saveRecommendation(recommendation: Omit<Recommendation, 'id'>): Promise<Recommendation> {
    try {
      const saved = await prisma.recommendation.create({
        data: {
          farmerId: recommendation.farmerId,
          type: recommendation.type,
          title: recommendation.title,
          message: recommendation.message,
          recommendation: recommendation.recommendation,
          confidence: recommendation.confidence,
          priority: recommendation.priority,
          actionRequired: recommendation.actionRequired,
          details: recommendation.details,
          expiresAt: recommendation.expiresAt,
        }
      });
      
      return {
        id: saved.id,
        farmerId: saved.farmerId,
        type: saved.type,
        title: saved.title,
        message: saved.message,
        recommendation: saved.recommendation,
        confidence: saved.confidence as 'low' | 'medium' | 'high',
        priority: saved.priority,
        actionRequired: saved.actionRequired,
        details: toDetailsRecord(saved.details),
        generatedAt: saved.generatedAt,
        expiresAt: saved.expiresAt ?? undefined,
      };
    } catch (error) {
      logger.error(`Error saving ${this.recommendationType} recommendation:`, error);
      throw error;
    }
  }
  
  /**
   * Get recent recommendations for a farmer
   * @param farmerId The farmer's user ID
   * @param limit Maximum number of recommendations to return
   * @returns Promise resolving to array of recommendations
   */
  protected async getRecentRecommendations(farmerId: string, limit: number = 5): Promise<Recommendation[]> {
    try {
      const recommendations = await prisma.recommendation.findMany({
        where: {
          farmerId,
          type: this.recommendationType,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        orderBy: { generatedAt: 'desc' },
        take: limit
      });
      
      return recommendations.map(rec => ({
        id: rec.id,
        farmerId: rec.farmerId,
        type: rec.type,
        title: rec.title,
        message: rec.message,
        recommendation: rec.recommendation,
        confidence: rec.confidence as 'low' | 'medium' | 'high',
        priority: rec.priority,
        actionRequired: rec.actionRequired,
        details: toDetailsRecord(rec.details),
        generatedAt: rec.generatedAt,
        expiresAt: rec.expiresAt ?? undefined,
      }));
    } catch (error) {
      logger.error(`Error getting recent ${this.recommendationType} recommendations:`, error);
      return [];
    }
  }
  
  /**
   * Calculate confidence based on data quality and freshness
   * @param dataQuality Score from 0-1 representing data quality
   * @param dataFreshness Hours since data was last updated
   * @returns Confidence level
   */
  protected calculateConfidence(dataQuality: number, dataFreshness: number): 'low' | 'medium' | 'high' {
    // Data quality factor (0-1)
    // Data freshness factor (penalize older data)
    const freshnessFactor = Math.max(0, 1 - (dataFreshness / 24)); // Assume 24h is max acceptable age
    
    // Combined score
    const score = (dataQuality * 0.6) + (freshnessFactor * 0.4);
    
    if (score >= 0.8) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }
  
  /**
   * Determine if we should generate a new recommendation or return a cached one
   * @param farmerId The farmer's user ID
   * @param maxAgeHours Maximum age in hours for cached recommendation
   * @returns Promise resolving to boolean indicating if we should generate new
   */
  protected async shouldGenerateNewRecommendation(farmerId: string, maxAgeHours: number = 4): Promise<boolean> {
    try {
      const recentRecs = await this.getRecentRecommendations(farmerId, 1);
      
      if (recentRecs.length === 0) {
        return true; // No existing recommendation
      }
      
      const mostRecent = recentRecs[0];
      const ageInHours = (Date.now() - mostRecent.generatedAt!.getTime()) / (1000 * 60 * 60);
      
      return ageInHours > maxAgeHours;
    } catch (error) {
      logger.error(`Error checking if we should generate new ${this.recommendationType} recommendation:`, error);
      return true; // Default to generating new on error
    }
  }
}