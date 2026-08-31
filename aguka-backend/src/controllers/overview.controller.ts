import { Response, NextFunction } from "express";
import { prisma } from "../prisma.js";
import { RequestWithUser } from "../types/index.js";
import { NotFoundError } from "../middleware/error.middleware.js";

export const getOverview = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  try {
    let farmerId = req.user?.farmerId;

    // Fallback: If not in JWT, fetch from DB
    if (!farmerId && req.user?.sub) {
      const profile = await prisma.farmerProfile.findUnique({
        where: { userId: req.user.sub },
        select: { id: true },
      });
      farmerId = profile?.id;
    }

    if (!farmerId) {
      throw new NotFoundError("Farmer profile not found for this user");
    }

    // Latest soil reading
    const latestSoil = await prisma.soilReading.findFirst({
      where: {
        farmerId: farmerId,
      },
      orderBy: { readingAt: "desc" },
      select: {
        moisturePercent: true,
        temperatureCelsius: true,
        phLevel: true,
        nitrogenPpm: true,
        phosphorusPpm: true,
        potassiumPpm: true,
        readingAt: true,
      },
    });

    // 7-day soil trend
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const soilTrend = await prisma.soilReading.findMany({
      where: {
        farmerId: farmerId,
        readingAt: { gte: sevenDaysAgo },
      },
      orderBy: { readingAt: "asc" },
      select: {
        readingAt: true,
        moisturePercent: true,
        temperatureCelsius: true,
        phLevel: true,
      },
    });

    // Crops for this farmer
    const crops = await prisma.farmerCrop.findMany({
      where: { farmerId: farmerId },
      include: {
        crop: {
          select: {
            nameEn: true,
            category: true,
            growingPeriodDays: true,
          },
        },
      },
      orderBy: { plantedDate: "desc" },
    });

    // Recent activities (last 5)
    const activities = await prisma.farmActivity.findMany({
      where: { farmerId: farmerId },
      orderBy: { activityDate: "desc" },
      take: 5,
    });

    // Farmer profile
    const profile = await prisma.farmerProfile.findUnique({
      where: { id: farmerId },
      select: { fullName: true, farmName: true, district: true, sector: true },
    });

    if (!profile) {
      throw new NotFoundError("Farmer profile not found");
    }

    // Latest Weather Reading
    const latestWeather = await prisma.weatherReading.findFirst({
      where: { farmerId: farmerId },
      orderBy: { readingAt: "desc" },
      select: {
        temperatureCelsius: true,
        humidityPercent: true,
        rainfallMm: true,
        forecast7day: true,
      },
    });

    // Map Prisma models to OverviewResponse format
    const response = {
      farmer: {
        fullName: profile.fullName,
        farmName: profile.farmName || "",
        district: profile.district || "",
        sector: profile.sector || "",
      },
      soilLatest: {
        moisture: latestSoil?.moisturePercent
          ? Number(latestSoil.moisturePercent)
          : null,
        temperature: latestSoil?.temperatureCelsius
          ? Number(latestSoil.temperatureCelsius)
          : null,
        ph: latestSoil?.phLevel ? Number(latestSoil.phLevel) : null,
        nitrogen: latestSoil?.nitrogenPpm
          ? Number(latestSoil.nitrogenPpm)
          : null,
        phosphorus: latestSoil?.phosphorusPpm
          ? Number(latestSoil.phosphorusPpm)
          : null,
        potassium: latestSoil?.potassiumPpm
          ? Number(latestSoil.potassiumPpm)
          : null,
        recordedAt: latestSoil?.readingAt?.toISOString() || null,
        hasData: !!latestSoil,
      },
      soilTrend: soilTrend.map((t) => ({
        recordedAt: t.readingAt.toISOString(),
        moisture: Number(t.moisturePercent),
        temperature: Number(t.temperatureCelsius) || 0,
        ph: Number(t.phLevel) || 0,
      })),
      weather: {
        temperature: latestWeather?.temperatureCelsius
          ? Number(latestWeather.temperatureCelsius)
          : 22,
        condition:
          latestWeather?.rainfallMm && Number(latestWeather.rainfallMm) > 0
            ? "Rainy"
            : "Sunny",
        humidity: latestWeather?.humidityPercent
          ? Number(latestWeather.humidityPercent)
          : 60,
        forecast: (latestWeather?.forecast7day as any[]) || [],
      },
      crops: crops.map((c) => ({
        id: c.id,
        cropName: c.crop?.nameEn || "Unknown",
        cropCategory: c.crop?.category || "Unknown",
        areaHectares: Number(c.plotSizeHectares) || 0,
        plantedDate: c.plantedDate.toISOString(),
        growingDurationDays: c.crop?.growingPeriodDays || 90,
        status: c.status,
        estimatedYieldKg: c.estimatedYieldKg
          ? Number(c.estimatedYieldKg)
          : null,
        location: profile.sector || profile.district || "Farm",
      })),
      recentActivities: activities.map((a) => {
        const crop = crops.find((c) => c.id === a.cropId);
        return {
          id: a.id,
          activityType: a.activityType,
          cropName: crop?.crop?.nameEn || null,
          notes: a.notes,
          activityDate: a.activityDate.toISOString(),
        };
      }),
    };

    return res.json({ success: true, data: response });
  } catch (error) {
    return next(error);
  }
};
