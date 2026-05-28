import { prisma } from "../prisma.js";
import {
  NotFoundError,
  ForbiddenError,
} from "../middleware/error.middleware.js";

export class ActivityService {
  async getFarmerActivities(
    farmerId: string,
    params: {
      page?: number;
      limit?: number;
      cropId?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = { farmerId };

    if (params.cropId) {
      where.cropId = params.cropId;
    }

    if (params.startDate) {
      where.activityDate = {
        ...((where.activityDate as object) || {}),
        gte: params.startDate,
      };
    }

    if (params.endDate) {
      where.activityDate = {
        ...((where.activityDate as object) || {}),
        lte: params.endDate,
      };
    }

    const [activities, total] = await Promise.all([
      prisma.farmActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { activityDate: "desc" },
      }),
      prisma.farmActivity.count({ where }),
    ]);

    return {
      data: activities,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async getActivities(params: {
    page?: number;
    limit?: number;
    cropId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.cropId) {
      where.cropId = params.cropId;
    }

    if (params.startDate) {
      where.activityDate = {
        ...((where.activityDate as object) || {}),
        gte: params.startDate,
      };
    }

    if (params.endDate) {
      where.activityDate = {
        ...((where.activityDate as object) || {}),
        lte: params.endDate,
      };
    }

    const [activities, total] = await Promise.all([
      prisma.farmActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { activityDate: "desc" },
      }),
      prisma.farmActivity.count({ where }),
    ]);

    return {
      data: activities,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  async getActivityById(id: string, userId: string) {
    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!farmerProfile) {
      throw new NotFoundError("Farmer profile");
    }

    const activity = await prisma.farmActivity.findFirst({
      where: { id, farmerId: farmerProfile.id },
    });

    if (!activity) {
      throw new NotFoundError("Activity");
    }

    return activity;
  }

  async getActivityTypes(userId: string) {
    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId },
    });

    if (!farmerProfile) {
      throw new NotFoundError("Farmer profile");
    }

    const rows = await prisma.farmActivity.findMany({
      distinct: ["activityType"],
      select: { activityType: true },
      orderBy: { activityType: "asc" },
    });

    return rows.map((row) => row.activityType);
  }

  async createActivity(farmerId: string, data: Record<string, unknown>) {
    // Verify the farmer exists
    const farmerProfile = await prisma.farmerProfile.findFirst({
      where: { userId: farmerId },
    });

    if (!farmerProfile) {
      throw new NotFoundError("Farmer profile");
    }

    const activity = await prisma.farmActivity.create({
      data: {
        farmerId: farmerProfile.id,
        activityType: data.activityType as string,
        category: data.category as string,
        cropId: (data.cropId || data.farmerCropId) as string,
        quantity: data.quantity as number,
        unit: data.unit as string,
        costRwf: data.costRwf as number,
        notes: data.notes as string,
        activityDate: data.activityDate
          ? new Date(data.activityDate as string)
          : new Date(),
      },
    });

    return activity;
  }

  async updateActivity(
    id: string,
    farmerId: string,
    data: Record<string, unknown>,
  ) {
    const activity = await prisma.farmActivity.findFirst({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundError("Activity");
    }

    // Check if the activity belongs to the farmer
    if (activity.farmerId !== farmerId) {
      throw new ForbiddenError("You can only update your own activities");
    }

    const updatedActivity = await prisma.farmActivity.update({
      where: { id },
      data: {
        activityType: data.activityType as string,
        category: data.category as string,
        cropId: data.cropId as string,
        quantity: data.quantity as number,
        unit: data.unit as string,
        costRwf: data.costRwf as number,
        notes: data.notes as string,
        activityDate: data.activityDate
          ? new Date(data.activityDate as string)
          : activity.activityDate,
      },
    });

    return updatedActivity;
  }

  async deleteActivity(id: string, farmerId: string) {
    const activity = await prisma.farmActivity.findFirst({
      where: { id },
    });

    if (!activity) {
      throw new NotFoundError("Activity");
    }

    // Check if the activity belongs to the farmer
    if (activity.farmerId !== farmerId) {
      throw new ForbiddenError("You can only delete your own activities");
    }

    await prisma.farmActivity.delete({
      where: { id },
    });

    return { message: "Activity deleted successfully" };
  }
}

export const activityService = new ActivityService();
