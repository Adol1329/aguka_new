import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { prisma } from '../prisma.js';

// Rwanda-specific agricultural sensor ranges
export const RWANDA_SENSOR_RANGES = {
  soilMoisture: {
    min: 15,    // % - Very dry (sandy soil)
    max: 85,    // % - Saturated (clay soil)
    optimal: 45, // % - Ideal for most crops
  },
  soilTemperature: {
    min: 12,    // °C - Cool night temperature
    max: 35,    // °C - Hot day temperature
    optimal: 25, // °C - Ideal for root growth
  },
  soilPh: {
    min: 4.5,   // Acidic
    max: 8.5,   // Alkaline
    optimal: 6.5, // Slightly acidic (ideal for Rwanda)
  },
  nitrogen: {
    min: 10,    // ppm - Deficient
    max: 200,   // ppm - Excessive
    optimal: 80, // ppm - Good level
  },
  phosphorus: {
    min: 5,     // ppm - Deficient
    max: 100,   // ppm - Excessive
    optimal: 40, // ppm - Good level
  },
  potassium: {
    min: 20,    // ppm - Deficient
    max: 300,   // ppm - Excessive
    optimal: 150, // ppm - Good level
  },
  humidity: {
    min: 30,    // % - Very dry
    max: 95,    // % - Very humid
    optimal: 65, // % - Comfortable
  },
  airTemperature: {
    min: 10,    // °C - Cool
    max: 32,    // °C - Hot
    optimal: 22, // °C - Ideal
  },
  rainfall: {
    min: 0,     // mm/hr - No rain
    max: 50,    // mm/hr - Heavy downpour
    light: 2.5, // mm/hr - Light rain
    moderate: 10, // mm/hr - Moderate rain
  },
  sunlight: {
    min: 0,     // W/m² - Night
    max: 1000,  // W/m² - Bright sun
    optimal: 600, // W/m² - Good sunlight
  },
};

export interface SensorReading {
  timestamp: Date;
  soilMoisture: number;
  soilTemperature: number;
  soilPh: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  humidity: number;
  airTemperature: number;
  rainfall: number;
  sunlight: number;
}

interface SimulationConfig {
  farmId: string;
  updateInterval: number; // milliseconds
  weatherPattern: 'sunny' | 'rainy' | 'mixed';
  soilType: 'sandy' | 'clay' | 'loamy';
  cropType: 'maize' | 'beans' | 'rice' | 'vegetables';
  irrigationSystem: boolean;
}

export class SensorEngine extends EventEmitter {
  private simulations: Map<string, SimulationConfig> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning = false;

  constructor() {
    super();
    logger.info('Sensor Engine initialized');
  }

  /**
   * Start simulation for a specific farm
   */
  async startSimulation(config: SimulationConfig): Promise<void> {
    try {
      // Stop existing simulation if running
      await this.stopSimulation(config.farmId);

      // Store simulation config
      this.simulations.set(config.farmId, config);

      // Generate initial reading
      const initialReading = this.generateSensorReading(config);
      await this.saveSensorReading(config.farmId, initialReading);
      
      // Emit initial reading
      this.emit('sensorData', {
        farmId: config.farmId,
        data: initialReading,
      });

      // Start periodic updates
      const interval = setInterval(async () => {
        const reading = this.generateSensorReading(config);
        await this.saveSensorReading(config.farmId, reading);
        
        this.emit('sensorData', {
          farmId: config.farmId,
          data: reading,
        });

        logger.debug(`Sensor data generated for farm ${config.farmId}`);
      }, config.updateInterval);

      this.intervals.set(config.farmId, interval);
      this.isRunning = true;

      logger.info(`Simulation started for farm ${config.farmId}`);
    } catch (error) {
      logger.error('Error starting simulation:', error);
      throw error;
    }
  }

  /**
   * Stop simulation for a specific farm
   */
  async stopSimulation(farmId: string): Promise<void> {
    try {
      const interval = this.intervals.get(farmId);
      if (interval) {
        clearInterval(interval);
        this.intervals.delete(farmId);
        this.simulations.delete(farmId);
        
        this.emit('simulationStopped', { farmId });
        logger.info(`Simulation stopped for farm ${farmId}`);
      }
    } catch (error) {
      logger.error('Error stopping simulation:', error);
      throw error;
    }
  }

  /**
   * Generate realistic sensor reading based on configuration
   */
  public generateSensorReading(config: SimulationConfig): SensorReading {
    const now = new Date();
    const hour = now.getHours();
    
    // Base values with realistic variations
    const baseReading = this.getBaseValues(config, hour);
    
    // Add random variations (±10% for most sensors)
    const reading: SensorReading = {
      timestamp: now,
      soilMoisture: this.addVariation(baseReading.soilMoisture, 0.1),
      soilTemperature: this.addVariation(baseReading.soilTemperature, 0.05),
      soilPh: this.addVariation(baseReading.soilPh, 0.02),
      nitrogen: this.addVariation(baseReading.nitrogen, 0.15),
      phosphorus: this.addVariation(baseReading.phosphorus, 0.15),
      potassium: this.addVariation(baseReading.potassium, 0.15),
      humidity: this.addVariation(baseReading.humidity, 0.1),
      airTemperature: this.addVariation(baseReading.airTemperature, 0.05),
      rainfall: (baseReading.rainfall ?? 0) > 0 ? this.addVariation(baseReading.rainfall ?? 0, 0.3) : 0,
      sunlight: this.calculateSunlight(hour, config.weatherPattern),
    };

    // Apply weather patterns
    this.applyWeatherPattern(reading, config.weatherPattern, hour);

    // Apply irrigation effects
    if (config.irrigationSystem && reading.soilMoisture < RWANDA_SENSOR_RANGES.soilMoisture.optimal - 10) {
      reading.soilMoisture += Math.random() * 15; // Irrigation boost
    }

    return reading;
  }

  /**
   * Get base values for different times and conditions
   */
  private getBaseValues(config: SimulationConfig, hour: number): Omit<SensorReading, 'timestamp'> {
    const ranges = RWANDA_SENSOR_RANGES;
    
    // Time-based variations
    const isDaytime = hour >= 6 && hour <= 18;
    const isMorning = hour >= 6 && hour <= 10;
    const isEvening = hour >= 16 && hour <= 20;
    
    return {
      soilMoisture: ranges.soilMoisture.optimal + (isMorning ? 5 : isEvening ? -3 : 0),
      soilTemperature: isDaytime ? ranges.soilTemperature.optimal + 5 : ranges.soilTemperature.optimal - 3,
      soilPh: ranges.soilPh.optimal,
      nitrogen: ranges.nitrogen.optimal,
      phosphorus: ranges.phosphorus.optimal,
      potassium: ranges.potassium.optimal,
      humidity: isDaytime ? ranges.humidity.optimal - 10 : ranges.humidity.optimal + 5,
      airTemperature: isDaytime ? ranges.airTemperature.optimal + 8 : ranges.airTemperature.optimal - 5,
      rainfall: config.weatherPattern === 'rainy' ? (Math.random() > 0.7 ? ranges.rainfall.moderate : 0) : 0,
      sunlight: 0, // Calculated separately
    };
  }

  /**
   * Apply weather patterns to sensor readings
   */
  private applyWeatherPattern(reading: SensorReading, pattern: string, hour: number): void {
    switch (pattern) {
      case 'sunny':
        reading.humidity -= 15;
        reading.airTemperature += 5;
        reading.soilMoisture -= 5;
        break;
      
      case 'rainy':
        reading.humidity += 20;
        reading.airTemperature -= 3;
        reading.soilMoisture += 15;
        reading.rainfall = Math.random() > 0.3 ? RWANDA_SENSOR_RANGES.rainfall.moderate : reading.rainfall;
        reading.sunlight *= 0.3; // Cloudy
        break;
      
      case 'mixed':
        // Mixed conditions with gradual changes
        if (hour >= 12 && hour <= 15) { // Afternoon rain likely
          reading.rainfall = Math.random() > 0.6 ? RWANDA_SENSOR_RANGES.rainfall.light : 0;
          reading.humidity += 10;
        }
        break;
    }

    // Ensure values stay within realistic ranges
    reading.soilMoisture = Math.max(RWANDA_SENSOR_RANGES.soilMoisture.min, 
                           Math.min(RWANDA_SENSOR_RANGES.soilMoisture.max, reading.soilMoisture));
    reading.humidity = Math.max(RWANDA_SENSOR_RANGES.humidity.min, 
                       Math.min(RWANDA_SENSOR_RANGES.humidity.max, reading.humidity));
    reading.airTemperature = Math.max(RWANDA_SENSOR_RANGES.airTemperature.min, 
                              Math.min(RWANDA_SENSOR_RANGES.airTemperature.max, reading.airTemperature));
  }

  /**
   * Calculate sunlight based on time of day and weather
   */
  private calculateSunlight(hour: number, weatherPattern: string): number {
    const ranges = RWANDA_SENSOR_RANGES.sunlight;
    
    if (hour < 6 || hour > 18) return 0; // Night
    
    // Peak sunlight at noon (hour 12)
    const dayProgress = Math.abs(12 - hour) / 6; // 0 at noon, 1 at 6am/6pm
    const baseSunlight = ranges.optimal * (1 - dayProgress);
    
    // Weather effects
    switch (weatherPattern) {
      case 'sunny':
        return baseSunlight;
      case 'rainy':
        return baseSunlight * 0.3;
      case 'mixed':
        return baseSunlight * (0.7 + Math.random() * 0.3);
      default:
        return baseSunlight;
    }
  }

  /**
   * Add realistic variation to sensor values
   */
  private addVariation(value: number, variationPercent: number): number {
    const variation = value * variationPercent * (Math.random() - 0.5) * 2;
    return Math.round((value + variation) * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Save sensor reading to database
   */
  private async saveSensorReading(farmId: string, reading: SensorReading): Promise<void> {
    try {
      // Find farmer profile for this farm
      const farmer = await prisma.farmerProfile.findFirst({
        where: { userId: farmId },
      });

      if (!farmer) {
        logger.warn(`Farmer profile not found for farm ${farmId}`);
        return;
      }

      // Save soil reading
      await prisma.soilReading.create({
        data: {
          farmerId: farmer.id,
          moisturePercent: reading.soilMoisture,
          temperatureCelsius: reading.soilTemperature,
          phLevel: reading.soilPh,
          nitrogenPpm: reading.nitrogen,
          phosphorusPpm: reading.phosphorus,
          potassiumPpm: reading.potassium,
          readingAt: reading.timestamp,
        },
      });

      // Save weather reading
      await prisma.weatherReading.create({
        data: {
          farmerId: farmer.id,
          temperatureCelsius: reading.airTemperature,
          humidityPercent: reading.humidity,
          rainfallMm: reading.rainfall,
          solarRadiationWm2: reading.sunlight,
          readingAt: reading.timestamp,
        },
      });

      logger.debug(`Sensor reading saved for farm ${farmId}`);
    } catch (error) {
      logger.error('Error saving sensor reading:', error);
    }
  }

  /**
   * Get current simulation status
   */
  getSimulationStatus(): {
    isRunning: boolean;
    activeSimulations: string[];
    totalSimulations: number;
  } {
    return {
      isRunning: this.isRunning,
      activeSimulations: Array.from(this.simulations.keys()),
      totalSimulations: this.simulations.size,
    };
  }

  /**
   * Get simulation configuration for a farm
   */
  getSimulationConfig(farmId: string): SimulationConfig | undefined {
    return this.simulations.get(farmId);
  }

  /**
   * Stop all simulations
   */
  async stopAllSimulations(): Promise<void> {
    const farmIds = Array.from(this.intervals.keys());
    await Promise.all(farmIds.map(id => this.stopSimulation(id)));
    
    this.isRunning = false;
    logger.info('All simulations stopped');
  }
}

// Export singleton instance
export const sensorEngine = new SensorEngine();
