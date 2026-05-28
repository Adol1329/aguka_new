import { alertService } from '../services/alert.service.js';
import { prisma } from '../prisma.js';
import { logger } from '../utils/logger.js';

/**
 * Alert Simulator
 * Used to manually trigger simulation alerts for testing Push Notifications and SMS
 */
export class AlertSimulator {
  /**
   * Simulate a critical drought alert for all farmers in a district
   */
  async simulateDistrictDrought(district: string) {
    logger.info(`🧪 SIMULATION: Triggering district drought alert for ${district}`);
    
    const farmers = await prisma.farmerProfile.findMany({
      where: { district },
      include: { user: true }
    });

    for (const farmer of farmers) {
      await alertService.sendAlert({
        farmerId: farmer.id,
        alertType: 'weather',
        severity: 'critical',
        title: 'Extreme Drought Warning',
        message: `Aguka: Critical drought alert in ${district}. Soil moisture is dropping rapidly. Prepare irrigation systems.`,
        translationKey: 'alert.weather.drought_critical',
        translationParams: { district }
      });
    }

    return { count: farmers.length };
  }

  /**
   * Simulate a soil nutrient deficiency alert (NPK)
   */
  async simulateNutrientDeficiency(farmerId: string) {
    logger.info(`🧪 SIMULATION: Triggering NPK deficiency alert for farmer ${farmerId}`);

    return await alertService.sendAlert({
      farmerId: farmerId,
      alertType: 'soil',
      severity: 'warning',
      title: 'Low Nitrogen Detected',
      message: 'Aguka: Soil Nitrogen levels are below 10%. Consider applying Urea fertilizer soon.',
      translationKey: 'alert.soil.npk_low',
    });
  }

  /**
   * Simulate a pest outbreak warning
   */
  async simulatePestOutbreak(sector: string) {
    logger.info(`🧪 SIMULATION: Triggering pest outbreak alert for sector ${sector}`);

    const farmers = await prisma.farmerProfile.findMany({
      where: { sector },
    });

    for (const farmer of farmers) {
      await alertService.sendAlert({
        farmerId: farmer.id,
        alertType: 'pest',
        severity: 'warning',
        title: 'Pest Alert: Fall Armyworm',
        message: `Aguka: Reports of Fall Armyworm in ${sector}. Inspect your maize plots immediately.`,
      });
    }

    return { count: farmers.length };
  }
}

export const alertSimulator = new AlertSimulator();
