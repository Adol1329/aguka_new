import { prisma, basePrisma } from "../prisma.js";
import { UnauthorizedError } from "../middleware/error.middleware.js";
import { UserRole } from "@prisma/client";

export class OnboardingService {
  private async _findCooperativeByLocation(
    tx: any,
    district: string,
    sector: string,
  ) {
    if (!district) return null;

    if (sector) {
      const exact = await tx.cooperative.findFirst({
        where: {
          district: { equals: district, mode: "insensitive" },
          sector: { equals: sector, mode: "insensitive" },
          isActive: true,
          deletedAt: null,
        },
      });
      if (exact) return exact;
    }

    return tx.cooperative.findFirst({
      where: {
        district: { equals: district, mode: "insensitive" },
        isActive: true,
        deletedAt: null,
      },
    });
  }

  async onboardFarmer(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.farmer) {
      throw new UnauthorizedError(
        "Only farmers can complete farmer onboarding",
      );
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

      // Auto-assign to cooperative by location (district + sector match)
      const cooperative = await this._findCooperativeByLocation(
        tx,
        data.district,
        data.sector,
      );

      let assignedCooperative = null;
      if (cooperative) {
        assignedCooperative = cooperative;

        await tx.farmerProfile.update({
          where: { id: profile.id },
          data: { cooperativeId: cooperative.id },
        });

        const existingMember = await tx.cooperativeMember.findUnique({
          where: { userId: user.id },
        });

        if (!existingMember) {
          await tx.cooperativeMember.create({
            data: {
              userId: user.id,
              cooperativeId: cooperative.id,
              role: "member",
              status: "active",
            },
          });
        }
      }

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          isOnboarded: true,
          district: data.district || null,
          sector: data.sector || null,
          cell: data.cell || null,
          village: data.village || null,
        },
        include: {
          farmerProfile: true,
          cooperativeMember: true,
        },
      });

      const { passwordHash: _pw, ...safeUser } = updatedUser as any;
      return {
        profile: { ...profile, cooperativeId: cooperative?.id ?? null },
        user: {
          ...safeUser,
          cooperativeId:
            cooperative?.id ??
            updatedUser.farmerProfile?.cooperativeId ??
            updatedUser.cooperativeMember?.cooperativeId ??
            null,
        },
        assignedCooperative: assignedCooperative
          ? { id: assignedCooperative.id, name: assignedCooperative.name, district: assignedCooperative.district, sector: assignedCooperative.sector }
          : null,
      };
    });
  }

  async onboardOfficer(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.officer) {
      throw new UnauthorizedError(
        "Only extension officers can complete officer onboarding",
      );
    }

    return await basePrisma.$transaction(async (tx: any) => {
      const employeeId = await this.generateEmployeeId(tx);

      const profile = await tx.extensionOfficerProfile.create({
        data: {
          userId: user.id,
          employeeId,
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

  /**
   * ExtensionOfficerProfile.employeeId is @unique, so generate against it directly.
   */
  private async generateEmployeeId(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const candidate = `OFF-${year}-${suffix}`;
      const existing = await tx.extensionOfficerProfile.findFirst({
        where: { employeeId: candidate },
      });
      if (!existing) return candidate;
    }
    throw new Error("Failed to generate a unique employee ID");
  }

  async onboardCooperative(userId: string, data: any) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== UserRole.cooperative) {
      throw new UnauthorizedError(
        "Only cooperatives can complete cooperative onboarding",
      );
    }

    return await basePrisma.$transaction(async (tx: any) => {
      const registrationNumber = await this.generateRegistrationNumber(tx);

      const profile = await tx.cooperativeProfile.create({
        data: {
          userId: user.id,
          cooperativeName: data.cooperativeName,
          registrationNumber,
          cooperativeType: data.cooperativeType,
          district: data.district,
          sector: data.sector,
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

  /**
   * Registration numbers must stay unique with the eventual Cooperative row
   * (Cooperative.registrationNumber is @unique), so generate against both tables.
   */
  private async generateRegistrationNumber(tx: any): Promise<string> {
    const year = new Date().getFullYear();
    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
      const candidate = `COOP-${year}-${suffix}`;
      const [existingProfile, existingCoop] = await Promise.all([
        tx.cooperativeProfile.findFirst({ where: { registrationNumber: candidate } }),
        tx.cooperative.findFirst({ where: { registrationNumber: candidate } }),
      ]);
      if (!existingProfile && !existingCoop) return candidate;
    }
    throw new Error("Failed to generate a unique cooperative registration number");
  }
}

export const onboardingService = new OnboardingService();
