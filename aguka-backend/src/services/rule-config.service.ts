import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

/**
 * Service for managing recommendation rules stored in the database
 * Allows for easy adjustment of recommendation logic without code changes
 */
export class RuleConfigService {
  /**
   * Get all active rules for a specific recommendation type
   * @param type The recommendation type (e.g., 'irrigation', 'pest-disease')
   * @returns Promise resolving to array of rule configurations
   */
  public static async getRulesByType(type: string): Promise<any[]> {
    try {
      const rules = await prisma.recommendationRule.findMany({
        where: {
          type,
          enabled: true
        },
        orderBy: {
          priority: 'desc' // Higher priority first
        }
      });
      
      return rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        conditions: rule.conditions,
        priority: rule.priority
      }));
    } catch (error) {
      logger.error(`Error fetching rules for type ${type}:`, error);
      return [];
    }
  }
  
  /**
   * Evaluate conditions against provided data
   * @param conditions JSON conditions object
   * @param data Data to evaluate against
   * @returns Boolean indicating if conditions are met
   */
  public static evaluateConditions(conditions: any, data: any): boolean {
    if (!conditions) return true; // No conditions means always true
    
    try {
      // Simple condition evaluation for common operators
      for (const [field, condition] of Object.entries(conditions)) {
        const value = this.getNestedValue(data, field);
        
        if (value === undefined) {
          // If field doesn't exist in data, condition fails
          return false;
        }
        
        if (!this.evaluateCondition(value, condition)) {
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logger.error("Error evaluating conditions:", error);
      return false; // Fail safe - if we can't evaluate, assume conditions not met
    }
  }
  
  /**
   * Get nested value from object using dot notation
   * @param obj Object to extract value from
   * @param path Dot-notation path (e.g., "soil.moisture")
   * @returns Value at path or undefined if not found
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  
  /**
   * Evaluate a single condition
   * @param value The value to test
   * @param condition The condition object (supports various operators)
   * @returns Boolean indicating if condition passes
   */
  private static evaluateCondition(value: any, condition: any): boolean {
    // Handle simple equality
    if (typeof condition !== 'object' || condition === null) {
      return value == condition;
    }
    
    // Handle operators
    if (condition.$gt !== undefined) {
      return value > condition.$gt;
    }
    
    if (condition.$gte !== undefined) {
      return value >= condition.$gte;
    }
    
    if (condition.$lt !== undefined) {
      return value < condition.$lt;
    }
    
    if (condition.$lte !== undefined) {
      return value <= condition.$lte;
    }
    
    if (condition.$ne !== undefined) {
      return value != condition.$ne;
    }
    
    if (condition.$in !== undefined) {
      return condition.$in.includes(value);
    }
    
    if (condition.$nin !== undefined) {
      return !condition.$nin.includes(value);
    }
    
    // Handle regex patterns
    if (condition.$regex !== undefined) {
      const regex = new RegExp(condition.$regex, condition.$options || '');
      return regex.test(value);
    }
    
    // If we don't recognize the condition format, assume it fails
    logger.warn(`Unrecognized condition format:`, condition);
    return false;
  }
  
  /**
   * Create a new recommendation rule
   * @param ruleData Rule configuration data
   * @returns Promise resolving to created rule
   */
  public static async createRule(ruleData: {
    name: string;
    description?: string;
    type: string;
    enabled?: boolean;
    conditions?: any;
    priority?: number;
  }): Promise<any> {
    try {
      const rule = await prisma.recommendationRule.create({
        data: {
          name: ruleData.name,
          description: ruleData.description,
          type: ruleData.type,
          enabled: ruleData.enabled ?? true,
          conditions: ruleData.conditions,
          priority: ruleData.priority ?? 1
        }
      });
      
      return rule;
    } catch (error) {
      logger.error("Error creating recommendation rule:", error);
      throw error;
    }
  }
  
  /**
   * Update an existing recommendation rule
   * @param ruleId ID of rule to update
   * @param ruleData Updated rule data
   * @returns Promise resolving to updated rule
   */
  public static async updateRule(ruleId: string, ruleData: {
    name?: string;
    description?: string;
    type?: string;
    enabled?: boolean;
    conditions?: any;
    priority?: number;
  }): Promise<any> {
    try {
      const rule = await prisma.recommendationRule.update({
        where: { id: ruleId },
        data: {
          name: ruleData.name,
          description: ruleData.description,
          type: ruleData.type,
          enabled: ruleData.enabled,
          conditions: ruleData.conditions,
          priority: ruleData.priority
        }
      });
      
      return rule;
    } catch (error) {
      logger.error(`Error updating recommendation rule ${ruleId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a recommendation rule
   * @param ruleId ID of rule to delete
   * @returns Promise resolving when deleted
   */
  public static async deleteRule(ruleId: string): Promise<void> {
    try {
      await prisma.recommendationRule.delete({
        where: { id: ruleId }
      });
    } catch (error) {
      logger.error(`Error deleting recommendation rule ${ruleId}:`, error);
      throw error;
    }
  }
}

export const ruleConfigService = new RuleConfigService();