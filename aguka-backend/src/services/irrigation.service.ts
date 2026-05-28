import { auditService } from "./audit.service.js";
import { prisma } from "../prisma.js";

export class IrrigationService {
  async getSchedules(farmerId: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      return [];
    }

    return prisma.irrigationSchedule.findMany({
      where: { farmerId: profile.id },
      include: { crop: { include: { crop: true } } },
    });
  }

  async getLogs(farmerId: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      return [];
    }

    return prisma.irrigationLog.findMany({
      where: { farmerId: profile.id },
      orderBy: { startTime: "desc" },
      take: 10,
    });
  }

  async createSchedule(farmerId: string, data: any) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      throw new Error("Farmer profile not found");
    }

    const schedule = await prisma.irrigationSchedule.create({
      data: {
        ...data,
        farmerId: profile.id,
      },
    });

    await auditService.logWithSnapshot({
      userId: farmerId,
      action: "CREATE_IRRIGATION_SCHEDULE",
      module: "IRRIGATION",
      resourceId: schedule.id,
      after: schedule,
    });

    return schedule;
  }

  async updateSchedule(farmerId: string, scheduleId: string, data: any) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      throw new Error("Farmer profile not found");
    }

    const existing = await prisma.irrigationSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existing || existing.farmerId !== profile.id) {
      throw new Error("Schedule not found or access denied");
    }

    const updated = await prisma.irrigationSchedule.update({
      where: { id: scheduleId },
      data,
    });

    await auditService.logWithSnapshot({
      userId: farmerId,
      action: "UPDATE_IRRIGATION_SCHEDULE",
      module: "IRRIGATION",
      resourceId: scheduleId,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async deleteSchedule(farmerId: string, scheduleId: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      throw new Error("Farmer profile not found");
    }

    const existing = await prisma.irrigationSchedule.findUnique({
      where: { id: scheduleId },
    });

    if (!existing || existing.farmerId !== profile.id) {
      throw new Error("Schedule not found or access denied");
    }

    await prisma.irrigationSchedule.delete({
      where: { id: scheduleId },
    });

    await auditService.logAction({
      userId: farmerId,
      action: "DELETE_IRRIGATION_SCHEDULE",
      module: "IRRIGATION",
      resourceId: scheduleId,
      details: `Schedule ${scheduleId} deleted`,
    });

    return { id: scheduleId, deleted: true };
  }

  async triggerIrrigation(farmerId: string, zoneId: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      throw new Error("Farmer profile not found");
    }

    const zone = await prisma.irrigationZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone || zone.farmerId !== profile.id) {
      throw new Error("Zone not found or access denied");
    }

    const log = await prisma.irrigationLog.create({
      data: {
        farmerId: profile.id,
        zoneId,
        action: "START",
        reason: "Manual trigger",
        triggeredBy: "manual",
        startTime: new Date(),
        status: "running",
      },
    });

    await prisma.irrigationZone.update({
      where: { id: zoneId },
      data: { status: "irrigating", lastIrrigated: new Date() },
    });

    return log;
  }

  async stopIrrigation(farmerId: string, zoneId: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile) {
      throw new Error("Farmer profile not found");
    }

    const zone = await prisma.irrigationZone.findUnique({
      where: { id: zoneId },
    });

    if (!zone || zone.farmerId !== profile.id) {
      throw new Error("Zone not found or access denied");
    }

    const runningLog = await prisma.irrigationLog.findFirst({
      where: {
        farmerId: profile.id,
        zoneId,
        status: "running",
      },
      orderBy: { startTime: "desc" },
    });

    if (runningLog) {
      const durationMinutes = runningLog.startTime
        ? Math.round(
            (Date.now() - new Date(runningLog.startTime).getTime()) / 60000,
          )
        : 0;

      await prisma.irrigationLog.update({
        where: { id: runningLog.id },
        data: {
          action: "STOP",
          endTime: new Date(),
          durationMinutes,
          status: "completed",
        },
      });
    }

    await prisma.irrigationZone.update({
      where: { id: zoneId },
      data: { status: "idle" },
    });

    return { stopped: true, zoneId };
  }

  async getStatus(farmerId: string) {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
    });

    if (!profile)
      return { isActive: false, zones: [], waterUsedToday: 0, savedWater: 0 };

    const zones = await prisma.irrigationZone.findMany({
      where: { farmerId: profile.id },
      select: {
        id: true,
        name: true,
        status: true,
        moistureLevel: true,
        temperature: true,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = await prisma.irrigationLog.findMany({
      where: {
        farmerId: profile.id,
        startTime: { gte: today },
      },
    });

    const totalWaterUsed = todayLogs.reduce(
      (sum, log) => sum + Number(log.waterUsedLiters || 0),
      0,
    );

    const activeZone = zones.find((z) => z.status === "irrigating");

    return {
      isActive: !!activeZone,
      activeZoneId: activeZone?.id || null,
      zones,
      waterUsedToday: totalWaterUsed,
      savedWater: Math.round(totalWaterUsed * 0.2),
    };
  }
}

export const irrigationService = new IrrigationService();
