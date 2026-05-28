// Define mock functions before jest.mock()
const mockFarmerFindFirst = jest.fn();
const mockFarmerFindMany = jest.fn();
const mockFarmerUpdate = jest.fn();
const mockFarmerCount = jest.fn();
const mockAssignmentFindMany = jest.fn();
const mockAssignmentFindFirst = jest.fn();
const mockAssignmentCreate = jest.fn();
const mockUserFindFirst = jest.fn();

// Mock @prisma/client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => {
    const mockPrisma = {
    farmerProfile: {
      findFirst: mockFarmerFindFirst,
      findMany: mockFarmerFindMany,
      update: mockFarmerUpdate,
      count: mockFarmerCount,
    },
    extensionOfficerAssignment: {
      findMany: mockAssignmentFindMany,
      findFirst: mockAssignmentFindFirst,
      create: mockAssignmentCreate,
    },
    user: {
      findFirst: mockUserFindFirst,
    },
    };

    return {
      ...mockPrisma,
      $extends: jest.fn(() => mockPrisma),
    };
  }),
}));

import { FarmerService } from '../../src/services/farmer.service.js';

describe('FarmerService', () => {
  let farmerService: FarmerService;

  beforeEach(() => {
    jest.clearAllMocks();
    farmerService = new FarmerService();
  });

  describe('getProfile', () => {
    it('should return farmer profile for valid user', async () => {
      const mockProfile = {
        id: 'profile-123',
        userId: 'user-123',
        fullName: 'John Doe',
        farmName: 'Sunny Farm',
        location: 'Kigali',
        district: 'Kigali',
        sector: 'Gasabo',
        cooperative: null,
        sensors: [],
        farmerCrops: [],
      };

      mockFarmerFindFirst.mockResolvedValue(mockProfile);

      const result = await farmerService.getProfile('user-123');

      expect(result.userId).toBe('user-123');
      expect(result.fullName).toBe('John Doe');
    });

    it('should throw NotFoundError for non-existent profile', async () => {
      mockFarmerFindFirst.mockResolvedValue(null);

      await expect(farmerService.getProfile('invalid-user')).rejects.toThrow("Farmer profile");
    });
  });

  describe('updateProfile', () => {
    it('should update farmer profile successfully', async () => {
      const mockProfile = {
        userId: 'user-123',
        fullName: 'Old Name',
      };

      const updatedProfile = {
        ...mockProfile,
        fullName: 'New Name',
        location: 'New Location',
        cooperative: null,
        sensors: [],
        farmerCrops: [],
      };

      mockFarmerFindFirst.mockResolvedValue(mockProfile);
      mockFarmerUpdate.mockResolvedValue(updatedProfile);

      const result = await farmerService.updateProfile('user-123', {
        fullName: 'New Name',
        location: 'New Location',
      });

      expect(result.fullName).toBe('New Name');
      expect(result.location).toBe('New Location');
    });
  });

  describe('listFarmers', () => {
    it('should return paginated list of farmers', async () => {
      const mockFarmers = [
        {
          id: 'farmer-1',
          fullName: 'Farmer One',
          district: 'Kigali',
          user: { status: 'active' },
        },
      ];

      mockFarmerFindMany.mockResolvedValue(mockFarmers);
      mockFarmerCount.mockResolvedValue(1);

      const result = await farmerService.listFarmers({
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.totalItems).toBe(1);
    });
  });

  describe('assignToOfficer', () => {
    it('should assign farmer to officer successfully', async () => {
      mockFarmerFindFirst.mockResolvedValue({ userId: 'farmer-123' });
      mockAssignmentFindFirst.mockResolvedValue(null);
      mockAssignmentCreate.mockResolvedValue({});

      const result = await farmerService.assignToOfficer('farmer-123', 'officer-123');

      expect(result.message).toBe('Farmer assigned successfully');
    });
  });
});
