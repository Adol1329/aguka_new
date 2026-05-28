import { AuthService } from '../../src/services/auth.service.js';
import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { UserStatus } from '../../src/types/index.js';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    farmerProfile: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
    },
    oTP: {
      create: jest.fn(),
      findFirst: jest.fn(),
      delete: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
    $extends: jest.fn(),
  };
  mockPrismaClient.$extends.mockReturnValue(mockPrismaClient);

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    UserRole: { FARMER: 'FARMER', ADMIN: 'ADMIN', SUPER_ADMIN: 'SUPER_ADMIN' },
  };
});

jest.mock('argon2');
jest.mock('jsonwebtoken');
jest.mock('../../src/utils/firebase.js', () => ({
  firebaseAdmin: {
    auth: jest.fn(() => ({
      verifyIdToken: jest.fn(),
    })),
  },
}));
jest.mock('../../src/services/sms.service.js', () => ({
  smsService: {
    sendSMS: jest.fn(),
  },
}));
jest.mock('../../src/mail/mail.service.js', () => ({
  mailService: {
    sendMail: jest.fn(),
  },
}));
jest.mock('../../src/utils/logger.js', () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock('../../src/config/index.js', () => ({
  config: {
    database: {
      url: 'postgresql://test:test@localhost:5432/test',
    },
    jwt: {
      secret: 'test-secret',
      refreshSecret: 'test-refresh-secret',
      expiresIn: '1h',
      refreshExpiresIn: '7d',
    },
  },
}));

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockPrisma = new PrismaClient();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        phone: '+250123456789',
        password: 'password123',
        role: 'FARMER',
        fullName: 'John Doe',
        language: 'en',
      };

      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        phone: userData.phone,
        role: userData.role,
        status: UserStatus.ACTIVE,
      });
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');
      (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

      const result = await authService.register(userData);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('fake-jwt-token');
      expect(result.refreshToken).toBe('fake-jwt-token');
      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if user already exists', async () => {
      const userData = {
        phone: '+250123456789',
        password: 'password123',
        role: 'FARMER',
      };

      mockPrisma.user.findFirst.mockResolvedValue({ id: 'existing-user' });

      await expect(authService.register(userData)).rejects.toThrow('already exists');
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        phone: '+250123456789',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        phone: loginData.phone,
        passwordHash: 'hashed-password',
        role: 'FARMER',
        status: UserStatus.ACTIVE,
        farmerProfile: null,
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token');

      const result = await authService.login(loginData);

      expect(result.user).toBeDefined();
      expect(result.accessToken).toBe('fake-jwt-token');
    });

    it('should throw UnauthorizedError for invalid credentials', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(
        authService.login({ phone: '+250123456789', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedError for invalid password', async () => {
      const mockUser = {
        id: 'user-123',
        phone: '+250123456789',
        passwordHash: 'hashed-password',
        status: UserStatus.ACTIVE,
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ phone: '+250123456789', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const mockDecoded = { sub: 'user-123', type: 'refresh' };
      const mockStoredToken = {
        token: 'old-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      mockPrisma.refreshToken.findFirst.mockResolvedValue(mockStoredToken);
      mockPrisma.user.findFirst.mockResolvedValue({ id: 'user-123', status: UserStatus.ACTIVE });
      (jwt.sign as jest.Mock).mockReturnValue('new-jwt-token');
      mockPrisma.refreshToken.update.mockResolvedValue({});

      const result = await authService.refreshToken('old-refresh-token');

      expect(result.accessToken).toBe('new-jwt-token');
      expect(result.refreshToken).toBe('new-jwt-token');
    });

    it('should throw UnauthorizedError for expired token', async () => {
      const mockDecoded = { sub: 'user-123' };
      const mockStoredToken = {
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 3600000), // Expired
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);
      mockPrisma.refreshToken.findFirst.mockResolvedValue(mockStoredToken);

      await expect(authService.refreshToken('expired-token')).rejects.toThrow('expired');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({});
      mockPrisma.session.deleteMany.mockResolvedValue({});

      const result = await authService.logout('user-123');

      expect(result.message).toBe('Logged out successfully');
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });
  });
});
