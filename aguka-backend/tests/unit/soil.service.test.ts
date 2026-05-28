// Define all mocks before any imports
const mockPrisma = {
  soilReading: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  farmerProfile: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
  },
  alert: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  cropRecommendation: {
    findMany: jest.fn(),
  },
  farmerCrop: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
};

// Mock @prisma/client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    ...mockPrisma,
    $extends: jest.fn(() => mockPrisma),
  })),
}));

import { SoilService } from '../../src/services/soil.service.js';

describe('SoilService', () => {
  let soilService: SoilService;

  beforeEach(() => {
    jest.clearAllMocks();
    soilService = new SoilService();
  });

  describe('getReadings', () => {
    it('should return soil readings for a farmer', async () => {
      const mockReadings = [
        {
          id: 'reading-1',
          moisturePercent: 45,
          temperatureCelsius: 25,
          readingAt: new Date(),
          sensor: { id: 'sensor-1' },
        },
      ];

      mockPrisma.soilReading.findMany.mockResolvedValue(mockReadings);

      const result = await soilService.getReadings('farmer-123', {
        limit: 100,
      });

      expect(result).toHaveLength(1);
      expect(result[0].moisture).toBe(45);
    });
  });

  describe('getCurrentStatus', () => {
    it('should return current soil status', async () => {
      const mockReading = {
        id: 'reading-1',
        moisturePercent: 60,
        temperatureCelsius: 28,
        phLevel: 6.5,
        nitrogenPpm: 40,
        phosphorusPpm: 20,
        potassiumPpm: 30,
        readingAt: new Date(),
        sensor: { id: 'sensor-1' },
      };

      mockPrisma.soilReading.findFirst.mockResolvedValue(mockReading);
      mockPrisma.farmerCrop.findFirst.mockResolvedValue(null);

      const result = await soilService.getCurrentStatus('farmer-123');

      expect(result.moisture).toBe(60);
    });

    it('should return simulated status when no readings exist', async () => {
      mockPrisma.soilReading.findFirst.mockResolvedValue(null);

      const result = await soilService.getCurrentStatus('farmer-123');

      expect(result).toMatchObject({
        id: 'sim_latest',
        moisture: 45,
        source: 'simulation',
        status: 'Fair',
      });
    });
  });

  describe('addReading', () => {
    it('should add a manual soil reading', async () => {
      const readingData = {
        moisturePercent: 45,
        temperatureCelsius: 28,
        phLevel: 6.5,
      };

      mockPrisma.soilReading.create.mockResolvedValue({
        id: 'new-reading',
        ...readingData,
      });

      const result = await soilService.addReading('farmer-123', readingData);

      expect(result.id).toBe('new-reading');
      expect(mockPrisma.soilReading.create).toHaveBeenCalled();
    });
  });
});
