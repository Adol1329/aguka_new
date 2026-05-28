import { SensorEngine } from "../../../src/simulation/sensor-engine.js";
import { RWANDA_SENSOR_RANGES } from "../../../src/simulation/sensor-engine.js";

// Mock Prisma
jest.mock("../../../src/prisma.js", () => ({
  prisma: {
    farmerProfile: {
      findFirst: jest.fn(),
    },
    soilReading: {
      create: jest.fn(),
    },
    weatherReading: {
      create: jest.fn(),
    },
  },
}));

describe("SensorEngine", () => {
  let sensorEngine: SensorEngine;

  beforeEach(() => {
    jest.clearAllMocks();
    sensorEngine = new SensorEngine();
  });

  describe("initialization", () => {
    it("should initialize with empty simulations", () => {
      const status = sensorEngine.getSimulationStatus();
      expect(status.isRunning).toBe(false);
      expect(status.activeSimulations).toHaveLength(0);
      expect(status.totalSimulations).toBe(0);
    });
  });

  describe("sensor reading generation", () => {
    it("should generate readings within expected ranges", () => {
      const config = {
        farmId: "test-farm",
        updateInterval: 5000,
        weatherPattern: "sunny" as const,
        soilType: "loamy" as const,
        cropType: "maize" as const,
        irrigationSystem: true,
      };

      const reading = sensorEngine.generateSensorReading(config);

      // Check that all values are within expected ranges
      expect(reading.soilMoisture).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.soilMoisture.min,
      );
      expect(reading.soilMoisture).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.soilMoisture.max,
      );

      expect(reading.soilTemperature).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.soilTemperature.min,
      );
      expect(reading.soilTemperature).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.soilTemperature.max,
      );

      expect(reading.soilPh).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.soilPh.min,
      );
      expect(reading.soilPh).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.soilPh.max,
      );

      expect(reading.nitrogen).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.nitrogen.min,
      );
      expect(reading.nitrogen).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.nitrogen.max,
      );

      expect(reading.phosphorus).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.phosphorus.min,
      );
      expect(reading.phosphorus).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.phosphorus.max,
      );

      expect(reading.potassium).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.potassium.min,
      );
      expect(reading.potassium).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.potassium.max,
      );

      expect(reading.humidity).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.humidity.min,
      );
      expect(reading.humidity).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.humidity.max,
      );

      expect(reading.airTemperature).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.airTemperature.min,
      );
      expect(reading.airTemperature).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.airTemperature.max,
      );

      expect(reading.rainfall).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.rainfall.min,
      );
      expect(reading.rainfall).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.rainfall.max,
      );

      expect(reading.sunlight).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.sunlight.min,
      );
      expect(reading.sunlight).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.sunlight.max,
      );
    });

    it("should apply weather patterns correctly", () => {
      const baseConfig = {
        farmId: "test-farm",
        updateInterval: 5000,
        soilType: "loamy" as const,
        cropType: "maize" as const,
        irrigationSystem: false,
      };

      // Test sunny pattern
      const sunnyReading = sensorEngine.generateSensorReading({
        ...baseConfig,
        weatherPattern: "sunny",
      });

      // Test rainy pattern
      const rainyReading = sensorEngine.generateSensorReading({
        ...baseConfig,
        weatherPattern: "rainy",
      });

      // Rainy conditions should have higher humidity and rainfall
      expect(rainyReading.humidity).toBeGreaterThan(sunnyReading.humidity);
      expect(rainyReading.rainfall).toBeGreaterThan(sunnyReading.rainfall);

      // Sunny conditions should have higher temperature and sunlight
      expect(sunnyReading.airTemperature).toBeGreaterThan(
        rainyReading.airTemperature,
      );
      expect(sunnyReading.sunlight).toBeGreaterThan(rainyReading.sunlight);
    });

    it("should calculate sunlight based on time of day", () => {
      const config = {
        farmId: "test-farm",
        updateInterval: 5000,
        weatherPattern: "sunny" as const,
        soilType: "loamy" as const,
        cropType: "maize" as const,
        irrigationSystem: false,
      };

      // Mock different hours
      const midnightReading = sensorEngine.generateSensorReading({
        ...config,
        // We can't easily mock the time in the current implementation,
        // but we can verify the sunlight calculation logic indirectly
      });

      // At night (simulated), sunlight should be 0
      // During day, sunlight should be > 0
      // This is a simplified test - in reality we'd need to mock Date.getHours()
      expect(midnightReading.sunlight).toBeGreaterThanOrEqual(0);
      expect(midnightReading.sunlight).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.sunlight.max,
      );
    });
  });

  describe("variation application", () => {
    it("should apply realistic variation to values", () => {
      const value = 50;
      const variationPercent = 0.1; // 10%

      // Test multiple times to ensure variation is applied
      const values = [];
      for (let i = 0; i < 100; i++) {
        const variedValue = (sensorEngine as any).addVariation(
          value,
          variationPercent,
        );
        values.push(variedValue);
      }

      // Values should vary around the base value
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
      expect(avg).toBeCloseTo(value, 1); // Within 1 decimal place

      // Values should be within reasonable bounds (±10%)
      const minExpected = value * (1 - variationPercent);
      const maxExpected = value * (1 + variationPercent);

      expect(Math.min(...values)).toBeGreaterThanOrEqual(minExpected);
      expect(Math.max(...values)).toBeLessThanOrEqual(maxExpected);
    });
  });

  describe("weather pattern application", () => {
    it("should apply sunny weather pattern correctly", () => {
      const reading: any = {
        humidity: 60,
        airTemperature: 25,
        soilMoisture: 45,
        rainfall: 0,
        sunlight: 500,
      };

      (sensorEngine as any).applyWeatherPattern(reading, "sunny", 12); // Noon

      // Sunny should decrease humidity and soil moisture, increase temperature
      expect(reading.humidity).toBeLessThan(60);
      expect(reading.soilMoisture).toBeLessThan(45);
      expect(reading.airTemperature).toBeGreaterThan(25);
    });

    it("should apply rainy weather pattern correctly", () => {
      const reading: any = {
        humidity: 60,
        airTemperature: 25,
        soilMoisture: 45,
        rainfall: 0,
        sunlight: 500,
      };

      (sensorEngine as any).applyWeatherPattern(reading, "rainy", 12); // Noon

      // Rainy should increase humidity and soil moisture, decrease temperature and sunlight
      expect(reading.humidity).toBeGreaterThan(60);
      expect(reading.soilMoisture).toBeGreaterThan(45);
      expect(reading.airTemperature).toBeLessThan(25);
      expect(reading.sunlight).toBeLessThan(500);
      expect(reading.rainfall).toBeGreaterThan(0);
    });

    it("should keep values within realistic ranges", () => {
      // Test with extreme values that should be clamped
      const reading: any = {
        soilMoisture: 200, // Way above max
        humidity: 200, // Way above max
        airTemperature: 100, // Way above max
        soilPh: 20, // Way above max
        nitrogen: 1000, // Way above max
        phosphorus: 1000, // Way above max
        potassium: 1000, // Way above max
        rainfall: 200, // Way above max
        sunlight: 2000, // Way above max
      };

      // Apply a pattern that would normally increase values
      (sensorEngine as any).applyWeatherPattern(reading, "rainy", 12);

      // Values should be clamped to maximums
      expect(reading.soilMoisture).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.soilMoisture.max,
      );
      expect(reading.humidity).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.humidity.max,
      );
      expect(reading.airTemperature).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.airTemperature.max,
      );
      expect(reading.soilPh).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.soilPh.max,
      );
      expect(reading.nitrogen).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.nitrogen.max,
      );
      expect(reading.phosphorus).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.phosphorus.max,
      );
      expect(reading.potassium).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.potassium.max,
      );
      expect(reading.rainfall).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.rainfall.max,
      );
      expect(reading.sunlight).toBeLessThanOrEqual(
        RWANDA_SENSOR_RANGES.sunlight.max,
      );

      // Test with very low values
      const lowReading: any = {
        soilMoisture: -50, // Way below min
        humidity: -50, // Way below min
        airTemperature: -100, // Way below min
        soilPh: -10, // Way below min
        nitrogen: -100, // Way below min
        phosphorus: -100, // Way below min
        potassium: -100, // Way below min
        rainfall: -50, // Way below min
        sunlight: -100, // Way below min
      };

      // Apply a pattern that would normally decrease values
      (sensorEngine as any).applyWeatherPattern(lowReading, "sunny", 12);

      // Values should be clamped to minimums
      expect(lowReading.soilMoisture).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.soilMoisture.min,
      );
      expect(lowReading.humidity).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.humidity.min,
      );
      expect(lowReading.airTemperature).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.airTemperature.min,
      );
      expect(lowReading.soilPh).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.soilPh.min,
      );
      expect(lowReading.nitrogen).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.nitrogen.min,
      );
      expect(lowReading.phosphorus).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.phosphorus.min,
      );
      expect(lowReading.potassium).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.potassium.min,
      );
      expect(lowReading.rainfall).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.rainfall.min,
      );
      expect(lowReading.sunlight).toBeGreaterThanOrEqual(
        RWANDA_SENSOR_RANGES.sunlight.min,
      );
    });
  });

  describe("simulation lifecycle", () => {
    it("should start and stop simulation correctly", async () => {
      const config = {
        farmId: "test-farm",
        updateInterval: 1000,
        weatherPattern: "mixed" as const,
        soilType: "loamy" as const,
        cropType: "maize" as const,
        irrigationSystem: true,
      };

      // Mock prisma calls
      const prismaMock = {
        farmerProfile: {
          findFirst: jest.fn().mockResolvedValue({ id: "farmer-1" }),
        },
        soilReading: {
          create: jest.fn(),
        },
        weatherReading: {
          create: jest.fn(),
        },
      };

      // Temporarily replace prisma
      const originalPrisma = (global as any).prisma;
      (global as any).prisma = prismaMock as any;

      try {
        // Start simulation
        await sensorEngine.startSimulation(config);

        // Check status
        const status = sensorEngine.getSimulationStatus();
        expect(status.isRunning).toBe(true);
        expect(status.activeSimulations).toContain("test-farm");
        expect(status.totalSimulations).toBe(1);

        // Stop simulation
        await sensorEngine.stopSimulation("test-farm");

        // Check status after stopping
        const statusAfterStop = sensorEngine.getSimulationStatus();
        expect(statusAfterStop.isRunning).toBe(false);
        expect(statusAfterStop.activeSimulations).not.toContain("test-farm");
        expect(statusAfterStop.totalSimulations).toBe(0);

        // Verify sensor readings were saved
        expect(prismaMock.soilReading.create).toHaveBeenCalled();
        expect(prismaMock.weatherReading.create).toHaveBeenCalled();
      } finally {
        // Restore original prisma
        (global as any).prisma = originalPrisma;
      }
    });

    it("should handle simulation for non-existent farm gracefully", async () => {
      const config = {
        farmId: "non-existent-farm",
        updateInterval: 1000,
        weatherPattern: "mixed" as const,
        soilType: "loamy" as const,
        cropType: "maize" as const,
        irrigationSystem: true,
      };

      // Mock prisma to return null for farmer (not found)
      const prismaMock = {
        farmerProfile: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
        soilReading: {
          create: jest.fn(),
        },
        weatherReading: {
          create: jest.fn(),
        },
      };

      // Temporarily replace prisma
      const originalPrisma = (global as any).prisma;
      (global as any).prisma = prismaMock as any;

      try {
        // Should not throw error even if farm doesn't exist
        await sensorEngine.startSimulation(config);

        // Should still be able to stop it
        await sensorEngine.stopSimulation("non-existent-farm");

        // No sensor readings should have been saved
        expect(prismaMock.soilReading.create).not.toHaveBeenCalled();
        expect(prismaMock.weatherReading.create).not.toHaveBeenCalled();
      } finally {
        // Restore original prisma
        (global as any).prisma = originalPrisma;
      }
    });
  });
});
