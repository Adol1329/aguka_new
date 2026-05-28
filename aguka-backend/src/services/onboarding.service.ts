import { prisma, basePrisma } from "../prisma.js";
import { UnauthorizedError } from "../middleware/error.middleware.js";
import { UserRole } from "@prisma/client";


export class OnboardingService {
  async onboardFarmer(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.farmer) {
      throw new UnauthorizedError("Only farmers can complete farmer onboarding");
    }

    return await basePrisma.$transaction(async (tx: any) => {
      const profile = await tx.farmerProfile.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          farmName: data.farmName,
          location: data.location,
          district: data.district,
          sector: data.sector,
          cell: data.cell,
          village: data.village,
          provinceCode: data.provinceCode,
          districtCode: data.districtCode,
          sectorCode: data.sectorCode,
          cellCode: data.cellCode,
          villageCode: data.villageCode,
          farmSizeHectares: data.farmSizeHectares,
          waterSource: data.waterSource,
          irrigationType: data.irrigationType,
          preferredChannel: data.preferredChannel,
        },
      });

      // Handle crops and livestock if provided
      if (data.crops && data.crops.length > 0) {
        // Logic to link crops...
      }

      await tx.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      });

      return profile;
    });
  }

  async onboardOfficer(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.officer) {
      throw new UnauthorizedError("Only extension officers can complete officer onboarding");
    }

    return await basePrisma.$transaction(async (tx: any) => {
      const profile = await tx.extensionOfficerProfile.create({
        data: {
          userId: user.id,
          employeeId: data.employeeId,
          organization: data.organization,
          specializations: data.specializations || [data.specialization],
          coveredSectors: data.coveredSectors || [data.assignedSector],
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      });

      return profile;
    });
  }

  async onboardCooperative(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.cooperative) {
      throw new UnauthorizedError("Only cooperatives can complete cooperative onboarding");
    }

    return await basePrisma.$transaction(async (tx: any) => {
      const profile = await tx.cooperativeProfile.create({
        data: {
          userId: user.id,
          cooperativeName: data.cooperativeName,
          registrationNumber: data.registrationNumber,
          cooperativeType: data.cooperativeType,
          memberCount: data.memberCount || data.memberCapacity,
          certificateUrl: data.certificateUrl,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { isOnboarded: true },
      });

      return profile;
    });
  }
}

export const onboardingService = new OnboardingService();
