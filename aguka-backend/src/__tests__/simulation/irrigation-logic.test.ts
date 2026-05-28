import { IrrigationLogic } from "../../../src/simulation/irrigation-logic.js";
import { SensorEngine } from "../../../src/simulation/sensor-engine.js";
import { EventEmitter } from "events";

// Mock SensorEngine
jest.mock("../../../src/simulation/sensor-engine.js", () => {
  const mockSensorEngine = new EventEmitter();
  return {
    SensorEngine: jest.fn().mockImplementation(() => mockSensorEngine),
    sensorEngine: mockSensorEngine,
  };
});

// Mock alertService
jest.mock("../../../src/services/alert.service.js", () => ({
  alertService: {
    sendAlert: jest.fn(),
  },
}));

describe("IrrigationLogic", () => {
  let irrigationLogic: IrrigationLogic;
  let sensorEngine: SensorEngine;

  beforeEach(() => {
    // Clear all mocks and instances
    jest.clearAllMocks();

    // Create fresh instances
    sensorEngine = new SensorEngine() as unknown as SensorEngine;
    irrigationLogic = new IrrigationLogic(sensorEngine);
  });

  describe("initialization", () => {
    it("should initialize with default rules", () => {
      const rules = irrigationLogic.getRules();
      expect(rules.length).toBeGreaterThan(0);

      // Check for specific crop rules
      const ruleNames = rules.map((r) => r.name);
      expect(ruleNames).toContain("Maize Irrigation Rule");
      expect(ruleNames).toContain("Beans Irrigation Rule");
      expect(ruleNames).toContain("Rice Irrigation Rule");
      expect(ruleNames).toContain("Vegetables Irrigation Rule");
    });

    it("should start automation on initialization", () => {
      // Automation should be enabled by default
      expect(irrigationLogic.getStatus().automationEnabled).toBe(true);
    });
  });

  describe("rule evaluation", () => {
    it("should evaluate moisture_low condition correctly", () => {
      const zone = {
        id: "zone-1",
        farmId: "farm-1",
        name: "Test Zone",
        size: 1.0,
        cropType: "maize",
        soilType: "loamy",
        isActive: true,
        currentStatus: "idle" as const,
        lastIrrigated: undefined,
        nextScheduled: undefined,
        moistureLevel: 25, // Below maize threshold of 35
        temperature: 25,
      };

      const rules = irrigationLogic.getApplicableRules("maize");
      expect(rules.length).toBe(1);
      expect(rules[0].condition).toBe("moisture_low");

      const action = irrigationLogic.evaluateRule(zone, rules[0]);
      expect(action).not.toBeNull();
      expect(action?.action).toBe("start");
      expect(action?.reason).toContain("Moisture level");
    });

    it("should not trigger irrigation when moisture is adequate", () => {
      const zone = {
        id: "zone-1",
        farmId: "farm-1",
        name: "Test Zone",
        size: 1.0,
        cropType: "maize",
        soilType: "loamy",
        isActive: true,
        currentStatus: "idle" as const,
        lastIrrigated: undefined,
        nextScheduled: undefined,
        moistureLevel: 50, // Above maize threshold of 35
        temperature: 25,
      };

      const rules = irrigationLogic.getApplicableRules("maize");
      const action = irrigationLogic.evaluateRule(zone, rules[0]);
      expect(action).toBeNull();
    });

    it("should stop irrigation when moisture is optimal", () => {
      const zone = {
        id: "zone-1",
        farmId: "farm-1",
        name: "Test Zone",
        size: 1.0,
        cropType: "maize",
        soilType: "loamy",
        isActive: true,
        currentStatus: "irrigating" as const,
        lastIrrigated: new Date(),
        nextScheduled: undefined,
        moistureLevel: 75, // Above maize max threshold of 70
        temperature: 25,
      };

      const rules = irrigationLogic.getApplicableRules("maize");
      const action = irrigationLogic.evaluateRule(zone, rules[0]);
      expect(action).not.toBeNull();
      expect(action?.action).toBe("stop");
      expect(action?.reason).toContain("reached optimal level");
    });

    it("should pause irrigation when temperature is too high", () => {
      const zone = {
        id: "zone-1",
        farmId: "farm-1",
        name: "Test Zone",
        size: 1.0,
        cropType: "maize",
        soilType: "loamy",
        isActive: true,
        currentStatus: "irrigating" as const,
        lastIrrigated: new Date(),
        nextScheduled: undefined,
        moistureLevel: 50,
        temperature: 40, // Above soilTempMax of 35
      };

      const rules = irrigationLogic.getApplicableRules("maize");
      const action = irrigationLogic.evaluateRule(zone, rules[0]);
      expect(action).not.toBeNull();
      expect(action?.action).toBe("pause");
      expect(action?.reason).toContain("outside safe range");
    });
  });

  describe("manual control", () => {
    it("should allow manual start of irrigation", async () => {
      // Mock the zone retrieval

      // Mock the prisma calls
      const prismaMock = {
        irrigationZone: {
          update: jest.fn(),
        },
        irrigationLog: {
          create: jest.fn(),
        },
      };

      // Temporarily replace prisma
      const originalPrisma = (global as any).prisma;
      (global as any).prisma = prismaMock as any;

      try {
        await irrigationLogic.manualControl("zone-1", "start", "Manual test");

        // Should have updated zone status
        expect(prismaMock.irrigationZone.update).toHaveBeenCalledWith({
          where: { id: "zone-1" },
          data: expect.objectContaining({
            status: "irrigating",
          }),
        });

        // Should have logged the action
        expect(prismaMock.irrigationLog.create).toHaveBeenCalled();
      } finally {
        // Restore original prisma
        (global as any).prisma = originalPrisma;
      }
    });

    it("should throw error for non-existent zone", async () => {
      // Mock empty zone retrieval
      const prismaMock = {
        farmerProfile: {
          findFirst: jest.fn().mockResolvedValue(null),
        },
      };

      // Temporarily replace prisma
      const originalPrisma = (global as any).prisma;
      (global as any).prisma = prismaMock as any;

      try {
        await expect(
          irrigationLogic.manualControl("nonexistent", "start", "Test"),
        ).rejects.toThrow("not found");
      } finally {
        // Restore original prisma
        (global as any).prisma = originalPrisma;
      }
    });
  });

  describe("automation control", () => {
    it("should enable and disable automation", () => {
      // Initially enabled
      expect(irrigationLogic.getStatus().automationEnabled).toBe(true);

      // Disable automation
      irrigationLogic.setAutomation(false);
      expect(irrigationLogic.getStatus().automationEnabled).toBe(false);

      // Re-enable automation
      irrigationLogic.setAutomation(true);
      expect(irrigationLogic.getStatus().automationEnabled).toBe(true);
    });
  });

  describe("cleanup", () => {
    it("should clean up intervals on destroy", () => {
      const clearIntervalSpy = jest.spyOn(global, "clearInterval");

      irrigationLogic.destroy();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});
