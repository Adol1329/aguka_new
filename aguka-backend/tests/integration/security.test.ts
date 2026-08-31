import request from 'supertest';
import { app } from '../../src/app.js';
import {
  createTestPrismaClient,
  clearDatabase,
  createTestUser,
  createTestFarmerProfile,
} from '../test-helpers.js';

jest.mock('../../src/middleware/auth.middleware.js', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      sub: req.headers['x-test-user-id'] || 'test-user',
      role: req.headers['x-test-role'] || 'farmer',
    };
    req.userId = req.user.sub;
    next();
  },
  optionalAuth: (_req: any, _res: any, next: any) => next(),
  authorize: (..._allowedRoles: string[]) => (_req: any, _res: any, next: any) =>
    next(),
  authorizeFarmerOrRole:
    (..._allowedRoles: string[]) =>
    (req: any, _res: any, next: any) => {
      if (
        req.params.id &&
        req.user &&
        req.user.sub !== req.params.id &&
        req.user.role === 'farmer'
      ) {
        return _res.status(403).json({ success: false, error: 'Forbidden' });
      }
      next();
    },
  checkPermission:
    (..._permissions: string[]) =>
    (_req: any, _res: any, next: any) =>
      next(),
  checkOwnership:
    (_resourceUserIdField?: string) =>
    (_req: any, _res: any, next: any) =>
      next(),
  logAudit: jest.fn(),
}));

const isDbAvailable = process.env.DATABASE_URL || process.env.TEST_DATABASE_URL;

(isDbAvailable ? describe : describe.skip)(
  'Security Integration Tests',
  () => {
    let prisma: any;
    let agent: any;

    beforeAll(async () => {
      prisma = createTestPrismaClient();
      agent = request.agent(app);
    });

    afterEach(async () => {
      if (prisma) await clearDatabase(prisma);
    });

    afterAll(async () => {
      if (prisma) await prisma.$disconnect();
    });

    it('should return 403 when officer accesses unassigned farmer', async () => {
      const farmerUser = await createTestUser(prisma, { role: 'farmer' });
      await createTestFarmerProfile(prisma, farmerUser.id);
      const res = await agent
        .get(`/api/v1/farmers/${farmerUser.id}`)
        .set('x-test-user-id', 'officer-unassigned')
        .set('x-test-role', 'officer');
      expect(res.status).toBe(403);
    });

    it('should return 200 when farmer accesses own reports', async () => {
      const farmerUser = await createTestUser(prisma, { role: 'farmer' });
      await createTestFarmerProfile(prisma, farmerUser.id);
      const res = await agent
        .get(`/api/v1/farmers/${farmerUser.id}/reports`)
        .set('x-test-user-id', farmerUser.id)
        .set('x-test-role', 'farmer');
      expect(res.status).toBe(200);
    });

    it('should return 403 when farmer accesses another farmer reports', async () => {
      const farmerA = await createTestUser(prisma, { role: 'farmer' });
      const farmerB = await createTestUser(prisma, { role: 'farmer' });
      await createTestFarmerProfile(prisma, farmerA.id);
      await createTestFarmerProfile(prisma, farmerB.id);
      const res = await agent
        .get(`/api/v1/farmers/${farmerB.id}/reports`)
        .set('x-test-user-id', farmerA.id)
        .set('x-test-role', 'farmer');
      expect(res.status).toBe(403);
    });

    it('should return 404 when farmer profile does not exist', async () => {
      const res = await agent
        .get('/api/v1/farmers/non-existent-id/profile')
        .set('x-test-user-id', 'some-officer')
        .set('x-test-role', 'officer');
      expect(res.status).toBe(404);
    });
  },
);
