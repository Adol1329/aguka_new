import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { SensorEngine, SensorReading, sensorEngine } from './sensor-engine.js';
import { prisma } from '../prisma.js';
import { alertService } from '../services/alert.service.js';

// Irrigation thresholds and rules
interface IrrigationThresholds {
  moistureMin: number;      // Minimum moisture level (below this = irrigation needed)
  moistureMax: number;      // Maximum moisture level (above this = stop irrigation)
  soilTempMin: number;     // Too cold for irrigation
  soilTempMax: number;     // Too hot for irrigation
  rainThreshold: number;   // Rain amount that should stop irrigation
  windThreshold: number;   // Wind speed that affects irrigation
}

interface IrrigationRule {
  id: string;
  name: string;
  condition: 'moisture_low' | 'temperature_high' | 'scheduled' | 'manual';
  thresholds: IrrigationThresholds;
  enabled: boolean;
  priority: number; // 1 = highest priority
}

interface IrrigationZone {
  id: string;
  farmId: string;
  name: string;
  size: number; // in hectares
  cropType: string;
  soilType: string;
  isActive: boolean;
  currentStatus: 'idle' | 'irrigating' | 'paused' | 'maintenance';
  lastIrrigated?: Date;
  nextScheduled?: Date;
  moistureLevel: number;
  temperature: number;
}

interface IrrigationAction {
  zoneId: string;
  action: 'start' | 'stop' | 'pause' | 'resume';
  reason: string;
  timestamp: Date;
  triggeredBy: 'automation' | 'manual' | 'schedule';
  sensorData?: SensorReading | null;
}

// Rwanda-specific irrigation thresholds
const RWANDA_THRESHOLDS: IrrigationThresholds = {
  moistureMin: 30,      // Below 30% = need irrigation
  moistureMax: 70,      // Above 70% = stop irrigation
  soilTempMin: 12,      // Too cold for effective irrigation
  soilTempMax: 35,      // Too hot (evaporation too high)
  rainThreshold: 2.5,   // 2.5mm/hr rain = stop irrigation
  windThreshold: 20,    // 20 km/h wind affects spray pattern
};

// Default irrigation rules for different crops
const DEFAULT_RULES: IrrigationRule[] = [
  {
    id: 'maize_rule',
    name: 'Maize Irrigation Rule',
    condition: 'moisture_low',
    thresholds: { ...RWANDA_THRESHOLDS, moistureMin: 35 },
    enabled: true,
    priority: 1,
  },
  {
    id: 'beans_rule',
    name: 'Beans Irrigation Rule',
    condition: 'moisture_low',
    thresholds: { ...RWANDA_THRESHOLDS, moistureMin: 40 },
    enabled: true,
    priority: 1,
  },
  {
    id: 'rice_rule',
    name: 'Rice Irrigation Rule',
    condition: 'moisture_low',
    thresholds: { ...RWANDA_THRESHOLDS, moistureMin: 25, moistureMax: 80 },
    enabled: true,
    priority: 1,
  },
  {
    id: 'vegetables_rule',
    name: 'Vegetables Irrigation Rule',
    condition: 'moisture_low',
    thresholds: { ...RWANDA_THRESHOLDS, moistureMin: 45 },
    enabled: true,
    priority: 1,
  },
];

export class IrrigationLogic extends EventEmitter {
  private zones: Map<string, IrrigationZone> = new Map();
  private rules: Map<string, IrrigationRule> = new Map();
  private automationEnabled = true;
  private checkInterval: NodeJS.Timeout | null = null;
  private sensorEngine: SensorEngine;

  constructor(sensorEngine: SensorEngine) {
    super();
    this.sensorEngine = sensorEngine;
    this.initializeDefaultRules();
    this.startAutomation();
    
    // Listen to sensor data updates
    this.sensorEngine.on('sensorData', this.handleSensorData.bind(this));
    
    logger.info('Irrigation Logic initialized');
  }

  /**
   * Initialize default irrigation rules
   */
  private initializeDefaultRules(): void {
    DEFAULT_RULES.forEach(rule => {
      this.rules.set(rule.id, rule);
    });
    logger.info(`Initialized ${DEFAULT_RULES.length} default irrigation rules`);
  }

  /**
   * Start automation system
   */
  private startAutomation(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check irrigation rules every 30 seconds
    this.checkInterval = setInterval(() => {
      if (this.automationEnabled) {
        this.checkAllZones();
      }
    }, 30000);

    logger.info('Irrigation automation started');
  }

  /**
   * Handle incoming sensor data
   */
  private async handleSensorData(data: { farmId: string; data: SensorReading }): Promise<void> {
    try {
      const { farmId, data: sensorData } = data;
      
      // Update zone sensor data
      await this.updateZoneSensorData(farmId, sensorData);
      
      // Check irrigation rules for this farm's zones
      await this.checkFarmZones(farmId);
    } catch (error) {
      logger.error('Error handling sensor data:', error);
    }
  }

  /**
   * Update zone sensor data
   */
  private async updateZoneSensorData(farmId: string, sensorData: SensorReading): Promise<void> {
    try {
      // Get zones for this farm
      const farmZones = await this.getFarmZones(farmId);
      
      farmZones.forEach(zone => {
        zone.moistureLevel = sensorData.soilMoisture;
        zone.temperature = sensorData.soilTemperature;
        this.zones.set(zone.id, zone);
      });
    } catch (error) {
      logger.error('Error updating zone sensor data:', error);
    }
  }

  /**
   * Check all zones for irrigation actions
   */
  private async checkAllZones(): Promise<void> {
    try {
      const zones = Array.from(this.zones.values());
      
      for (const zone of zones) {
        if (zone.isActive) {
          await this.checkZone(zone);
        }
      }
    } catch (error) {
      logger.error('Error checking all zones:', error);
    }
  }

  /**
   * Check specific zones for a farm
   */
  private async checkFarmZones(farmId: string): Promise<void> {
    try {
      const farmZones = Array.from(this.zones.values()).filter(z => z.farmId === farmId);
      
      for (const zone of farmZones) {
        if (zone.isActive) {
          await this.checkZone(zone);
        }
      }
    } catch (error) {
      logger.error('Error checking farm zones:', error);
    }
  }

  /**
   * Check a single zone for irrigation actions
   */
  private async checkZone(zone: IrrigationZone): Promise<void> {
    try {
      const applicableRules = this.getApplicableRules(zone.cropType);
      
      for (const rule of applicableRules) {
        if (!rule.enabled) continue;
        
        const action = this.evaluateRule(zone, rule);
        if (action) {
          await this.executeIrrigationAction(zone, action);
          break; // Only execute highest priority rule
        }
      }
    } catch (error) {
      logger.error(`Error checking zone ${zone.id}:`, error);
    }
  }

  /**
   * Get applicable rules for a crop type
   */
  private getApplicableRules(cropType: string): IrrigationRule[] {
    const allRules = Array.from(this.rules.values());
    
    // Get specific crop rule or default
    const cropRule = allRules.find(r => r.name.toLowerCase().includes(cropType.toLowerCase()));
    const defaultRules = allRules.filter(r => r.condition === 'moisture_low');
    
    const applicable = cropRule ? [cropRule] : defaultRules;
    
    // Sort by priority (lower number = higher priority)
    return applicable.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Evaluate if a rule triggers an irrigation action
   */
  private evaluateRule(zone: IrrigationZone, rule: IrrigationRule): IrrigationAction | null {
    const { thresholds } = rule;
    const { moistureLevel, temperature, currentStatus } = zone;
    
    // Get current sensor data for this zone
    const sensorData = this.getCurrentSensorData(zone.farmId);
    
    // Rule 1: Check if irrigation should START
    if (currentStatus === 'idle' || currentStatus === 'paused') {
      // Moisture too low
      if (moistureLevel < thresholds.moistureMin) {
        // Check if conditions are suitable for irrigation
        if (temperature >= thresholds.soilTempMin && 
            temperature <= thresholds.soilTempMax &&
            (!sensorData || sensorData.rainfall < thresholds.rainThreshold)) {
          return {
            zoneId: zone.id,
            action: 'start',
            reason: `Moisture level (${moistureLevel}%) below threshold (${thresholds.moistureMin}%)`,
            timestamp: new Date(),
            triggeredBy: 'automation',
            sensorData,
          };
        }
      }
    }
    
    // Rule 2: Check if irrigation should STOP
    if (currentStatus === 'irrigating') {
      // Moisture reached optimal level
      if (moistureLevel >= thresholds.moistureMax) {
        return {
          zoneId: zone.id,
          action: 'stop',
          reason: `Moisture level (${moistureLevel}%) reached optimal level (${thresholds.moistureMax}%)`,
          timestamp: new Date(),
          triggeredBy: 'automation',
          sensorData,
        };
      }
      
      // Rain detected
      if (sensorData && sensorData.rainfall >= thresholds.rainThreshold) {
        return {
          zoneId: zone.id,
          action: 'stop',
          reason: `Rain detected (${sensorData.rainfall}mm/hr)`,
          timestamp: new Date(),
          triggeredBy: 'automation',
          sensorData,
        };
      }
      
      // Temperature outside safe range
      if (temperature < thresholds.soilTempMin || temperature > thresholds.soilTempMax) {
        return {
          zoneId: zone.id,
          action: 'pause',
          reason: `Temperature (${temperature}°C) outside safe range (${thresholds.soilTempMin}-${thresholds.soilTempMax}°C)`,
          timestamp: new Date(),
          triggeredBy: 'automation',
          sensorData,
        };
      }
    }
    
    return null;
  }

  /**
   * Get current sensor data for a farm
   */
  private getCurrentSensorData(_farmId: string): SensorReading | null {
    // This would typically get the latest sensor reading from database
    // For now, return null (will be implemented with real sensor integration)
    return null;
  }

  /**
   * Execute irrigation action
   */
  private async executeIrrigationAction(zone: IrrigationZone, action: IrrigationAction): Promise<void> {
    try {
      // Update zone status
      switch (action.action) {
        case 'start':
          zone.currentStatus = 'irrigating';
          zone.lastIrrigated = action.timestamp;
          // Trigger Notification Alert
          await alertService.sendAlert({
            farmerId: zone.farmId,
            alertType: 'irrigation',
            severity: 'info',
            title: 'Irrigation Started',
            message: `Aguka: Irrigation started for ${zone.name}. Reason: ${action.reason}`,
            translationKey: 'alert.irrigation.started'
          });
          break;
        case 'stop':
          zone.currentStatus = 'idle';
          // Trigger Notification Alert
          await alertService.sendAlert({
            farmerId: zone.farmId,
            alertType: 'irrigation',
            severity: 'info',
            title: 'Irrigation Stopped',
            message: `Aguka: Irrigation stopped for ${zone.name}. Reason: ${action.reason}`,
            translationKey: 'alert.irrigation.stopped'
          });
          break;
        case 'pause':
          zone.currentStatus = 'paused';
          break;
        case 'resume':
          zone.currentStatus = 'irrigating';
          break;
      }

      // Save to database
      await this.saveIrrigationAction(zone, action);
      await this.updateZoneStatus(zone);

      // Emit event for real-time updates
      this.emit('irrigationAction', {
        zoneId: zone.id,
        action: action.action,
        reason: action.reason,
        timestamp: action.timestamp,
      });

      logger.info(`Irrigation ${action.action} for zone ${zone.id}: ${action.reason}`);
    } catch (error) {
      logger.error('Error executing irrigation action:', error);
    }
  }

  /**
   * Save irrigation action to database
   */
  private async saveIrrigationAction(zone: IrrigationZone, action: IrrigationAction): Promise<void> {
    try {
      await (prisma.irrigationLog as any).create({
        data: {
          zoneId: action.zoneId,
          farmerId: zone.farmId,
          action: action.action.toUpperCase(),
          reason: action.reason,
          triggeredBy: action.triggeredBy,
          executedAt: action.timestamp,
        },
      });
    } catch (error) {
      logger.error('Error saving irrigation action:', error);
    }
  }

  /**
   * Update zone status in database
   */
  private async updateZoneStatus(zone: IrrigationZone): Promise<void> {
    try {
      await prisma.irrigationZone.update({
        where: { id: zone.id },
        data: {
          status: zone.currentStatus,
          lastIrrigated: zone.lastIrrigated,
          moistureLevel: zone.moistureLevel,
          temperature: zone.temperature,
        },
      });
    } catch (error) {
      logger.error('Error updating zone status:', error);
    }
  }

  /**
   * Get zones for a farm
   */
  private async getFarmZones(farmId: string): Promise<IrrigationZone[]> {
    try {
      const farmer = await prisma.farmerProfile.findFirst({
        where: { userId: farmId },
        include: { irrigationZones: true },
      });

      if (!farmer) return [];

      return (farmer.irrigationZones as any[]).map(zone => ({
        id: zone.id,
        farmId,
        name: zone.name,
        size: Number(zone.sizeHectares),
        cropType: zone.cropType || 'vegetables',
        soilType: zone.soilType || 'loamy',
        isActive: zone.isActive,
        currentStatus: zone.status as any,
        lastIrrigated: zone.lastIrrigated,
        nextScheduled: zone.nextScheduled,
        moistureLevel: Number(zone.moistureLevel || 50),
        temperature: Number(zone.temperature || 25),
      }));
    } catch (error) {
      logger.error('Error getting farm zones:', error);
      return [];
    }
  }

  /**
   * Manual irrigation control
   */
  async manualControl(zoneId: string, action: 'start' | 'stop' | 'pause' | 'resume', reason: string): Promise<void> {
    try {
      const zone = this.zones.get(zoneId);
      if (!zone) {
        throw new Error(`Zone ${zoneId} not found`);
      }

      const irrigationAction: IrrigationAction = {
        zoneId,
        action,
        reason: reason || `Manual ${action} command`,
        timestamp: new Date(),
        triggeredBy: 'manual',
      };

      await this.executeIrrigationAction(zone, irrigationAction);
    } catch (error) {
      logger.error('Error in manual control:', error);
      throw error;
    }
  }

  /**
   * Enable/disable automation
   */
  setAutomation(enabled: boolean): void {
    this.automationEnabled = enabled;
    logger.info(`Irrigation automation ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get system status
   */
  getStatus(): {
    automationEnabled: boolean;
    totalZones: number;
    activeZones: number;
    irrigatingZones: number;
    rulesCount: number;
  } {
    const zones = Array.from(this.zones.values());
    const activeZones = zones.filter(z => z.isActive);
    const irrigatingZones = zones.filter(z => z.currentStatus === 'irrigating');

    return {
      automationEnabled: this.automationEnabled,
      totalZones: zones.length,
      activeZones: activeZones.length,
      irrigatingZones: irrigatingZones.length,
      rulesCount: this.rules.size,
    };
  }

  /**
   * Add custom irrigation rule
   */
  addRule(rule: IrrigationRule): void {
    this.rules.set(rule.id, rule);
    logger.info(`Added irrigation rule: ${rule.name}`);
  }

  /**
   * Remove irrigation rule
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    logger.info(`Removed irrigation rule: ${ruleId}`);
  }

  /**
   * Get all irrigation rules
   */
  getRules(): IrrigationRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.sensorEngine.removeAllListeners();
    logger.info('Irrigation Logic destroyed');
  }
}

// Export singleton instance (must be initialized with SensorEngine)
export const irrigationLogic = new IrrigationLogic(sensorEngine);
