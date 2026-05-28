import { PrismaClient } from '@prisma/client';

export const createTestPrismaClient = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./test.db',
      },
    },
  });
};

export const clearDatabase = async (prisma: PrismaClient) => {
  // Delete in order to respect foreign key constraints
  const tabels = [
    'RefreshToken',
    'Session',
    'Alert',
    'IoTDevice',
    'SoilReading',
    'WeatherReading',
    'IrrigationLog',
    'IrrigationSchedule',
    'FarmerCrop',
    'CropRecommendation',
    'ExtensionOfficerAssignment',
    'FarmerProfile',
    'User',
    'Cooperative',
    'OTP',
  ];

  for (const table of tabels) {
    await (prisma as any)[table.toLowerCase()].deleteMany();
  }
};

export const createTestUser = async (
  prisma: PrismaClient,
  data: { phone?: string; password?: string; role?: string } = {}
) => {
  const { argon2 } = await import('argon2');
  const passwordHash = data.password
    ? await argon2.hash(data.password)
    : null;

  const user = await prisma.user.create({
    data: {
      phone: data.phone || `+250999${Date.now().toString().slice(-9)}`,
      passwordHash,
      role: (data.role as any) || 'farmer',
      status: 'active',
    },
  });

  return user;
};

export const createTestFarmerProfile = async (
  prisma: PrismaClient,
  userId: string,
  data: any = {}
) => {
  return await prisma.farmerProfile.create({
    data: {
      userId,
      fullName: data.fullName || 'Test Farmer',
      farmName: data.farmName || 'Test Farm',
      location: data.location || 'Kigali',
      district: data.district || 'Kigali',
      sector: data.sector || 'Gasabo',
      ...data,
    },
  });
};
