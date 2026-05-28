import { prisma } from "../prisma.js";

export class ExtensionOfficerService {
  /**
   * Get analysis dashboard data for an extension officer
   * Includes summary statistics and trends for their assigned farmers
   */
  async getOfficerAnalysis(extensionOfficerId: string) {
    // Verify the user is an extension officer
    const officerProfile = await prisma.extensionOfficerProfile.findUnique({
      where: { userId: extensionOfficerId },
    });

    if (!officerProfile) {
      throw new Error("Extension officer profile not found");
    }

    // Get all farmers assigned to this officer
    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: { extensionOfficerId },
      include: {
        farmer: {
          include: {
            farmerProfile: {
              include: {
                cooperative: true,
                soilReadings: {
                  orderBy: { readingAt: "desc" },
                  take: 10, // Recent readings
                },
                farmActivities: {
                  orderBy: { activityDate: "desc" },
                  take: 10, // Recent activities
                },
              },
            },
          },
        },
      },
    });

    if (assignments.length === 0) {
      return {
        totalFarmers: 0,
        activeFarmers: 0,
        cooperativeInfo: null,
        performanceSummary: {
          avgSoilMoisture: 0,
          avgActivitiesPerFarmer: 0,
          totalIrrigationEvents: 0,
        },
        recentActivities: [],
        recentSoilReadings: [],
        farmers: [],
      };
    }

    // Extract farmer profiles with users
    const validFarmers = assignments.map(a => a.farmer).filter(f => f.farmerProfile !== null);
    
    // Get cooperative info (assuming all farmers belong to same cooperative)
    const cooperative =
      validFarmers.length > 0 && validFarmers[0].farmerProfile?.cooperativeId
        ? await prisma.cooperative.findUnique({
            where: { id: validFarmers[0].farmerProfile.cooperativeId },
          })
        : null;

    // Calculate performance metrics
    const soilReadings = validFarmers.flatMap((f) => 
      f.farmerProfile!.soilReadings.map(r => ({ ...r, farmer: f }))
    );
    const activities = validFarmers.flatMap((f) => 
      f.farmerProfile!.farmActivities.map(a => ({ ...a, farmer: f }))
    );

    const recentSoilReadings = soilReadings
      .slice(0, 20) // Limit to most recent
      .map((r) => ({
        id: r.id,
        farmerName: r.farmer.fullName?.trim() || r.farmer.phone,
        farmName: r.farmer.farmerProfile!.farmName,
        moisturePercent: Number(r.moisturePercent || 0),
        temperatureCelsius: r.temperatureCelsius
          ? Number(r.temperatureCelsius)
          : null,
        phLevel: r.phLevel ? Number(r.phLevel) : null,
        readingAt: r.readingAt,
      }));

    const recentActivities = activities
      .slice(0, 20) // Limit to most recent
      .map((a) => ({
        id: a.id,
        farmerName: a.farmer.fullName?.trim() || a.farmer.phone,
        farmName: a.farmer.farmerProfile!.farmName,
        activityType: a.activityType,
        category: a.category,
        quantity: a.quantity ? Number(a.quantity) : null,
        unit: a.unit,
        costRwf: a.costRwf ? Number(a.costRwf) : null,
        activityDate: a.activityDate,
      }));

    // Calculate averages
    const validMoistureReadings = soilReadings.filter(
      (r) => r.moisturePercent !== null
    );
    const avgSoilMoisture =
      validMoistureReadings.length > 0
        ? validMoistureReadings.reduce(
            (sum, r) => sum + Number(r.moisturePercent),
            0
          ) / validMoistureReadings.length
        : 0;

    const totalIrrigationEvents = activities.filter(
      (a) => a.activityType.toLowerCase().includes("irrigation")
    ).length;

    const avgActivitiesPerFarmer =
      validFarmers.length > 0 ? activities.length / validFarmers.length : 0;

    // Prepare farmer data for detailed view
    const farmersData = validFarmers.map((f) => {
      const p = f.farmerProfile!;
      const farmerSoilReadings = p.soilReadings || [];
      const farmerActivities = p.farmActivities || [];

      const avgMoisture =
        farmerSoilReadings.filter((r) => r.moisturePercent !== null).length > 0
          ? farmerSoilReadings
              .filter((r) => r.moisturePercent !== null)
              .reduce((sum, r) => sum + Number(r.moisturePercent), 0) /
            farmerSoilReadings.filter((r) => r.moisturePercent !== null).length
          : 0;

      return {
        id: p.id,
        userId: p.userId,
        fullName: f.fullName?.trim() || f.phone,
        farmName: p.farmName,
        district: p.district,
        cooperativeId: p.cooperativeId,
        cooperativeName: p.cooperative?.name,
        avgSoilMoisture: Number(avgMoisture.toFixed(2)),
        totalActivities: farmerActivities.length,
        totalIrrigation: farmerActivities.filter(
          (a) => a.activityType.toLowerCase().includes("irrigation")
        ).length,
        lastActivityDate:
          farmerActivities.length > 0
            ? Math.max(
                ...farmerActivities.map((a) => new Date(a.activityDate).getTime())
              )
            : null,
        lastSoilReadingDate:
          farmerSoilReadings.length > 0
            ? Math.max(
                ...farmerSoilReadings.map((r) => new Date(r.readingAt).getTime())
              )
            : null,
      };
    });

    return {
      totalFarmers: validFarmers.length,
      activeFarmers: validFarmers.filter(
        (f) =>
          f.farmerProfile!.soilReadings.length > 0 ||
          f.farmerProfile!.farmActivities.length > 0
      ).length,
      cooperativeInfo: cooperative
        ? {
            id: cooperative.id,
            name: cooperative.name,
            registrationNumber: cooperative.registrationNumber,
            district: cooperative.district,
          }
        : null,
      performanceSummary: {
        avgSoilMoisture: Number(avgSoilMoisture.toFixed(2)),
        avgActivitiesPerFarmer: Number(avgActivitiesPerFarmer.toFixed(2)),
        totalIrrigationEvents,
      },
      recentActivities,
      recentSoilReadings,
      farmers: farmersData,
    };
  }

  /**
   * Get detailed analysis for a specific farmer assigned to this officer
   */
  async getFarmerAnalysis(
    extensionOfficerId: string,
    farmerId: string
  ) {
    // Verify the officer is assigned to this farmer
    const assignment = await prisma.extensionOfficerAssignment.findFirst({
      where: {
        extensionOfficerId,
        farmerId,
      },
      include: {
        farmer: {
          include: {
            farmerProfile: {
              include: {
                cooperative: true,
                soilReadings: {
                  orderBy: { readingAt: "desc" },
                },
                farmActivities: {
                  orderBy: { activityDate: "desc" },
                },
                farmerCrops: {
                  include: {
                    crop: true,
                  },
                },
                irrigationZones: true,
              },
            },
          },
        },
      },
    });

    if (!assignment || !assignment.farmer.farmerProfile) {
      throw new Error("Farmer not assigned to this extension officer or profile missing");
    }

    const farmerProfile = assignment.farmer.farmerProfile;
    const user = assignment.farmer as any;

    // Calculate trends and statistics
    const soilReadings = farmerProfile.soilReadings || [];
    const activities = farmerProfile.farmActivities || [];
    const crops = farmerProfile.farmerCrops || [];
    const irrigationZones = farmerProfile.irrigationZones || [];

    // Soil moisture trend (last 10 readings)
    const moistureTrend = soilReadings
      .slice(0, 10)
      .map((r) => ({
        date: r.readingAt.toISOString().split("T")[0],
        moisture: Number(r.moisturePercent || 0),
      }))
      .reverse(); // Oldest first for charting

    // Activity frequency by type
    const activityByType = activities.reduce((acc, activity) => {
      const type = activity.activityType || "other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly activity trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentActivities = activities.filter(
      (a) => new Date(a.activityDate) >= sixMonthsAgo
    );

    const monthlyActivity = recentActivities.reduce((acc, activity) => {
      const date = new Date(activity.activityDate);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Crop information
    const cropInfo = crops.map((crop) => ({
      id: crop.id,
      cropName: crop.crop.nameEn,
      plantedDate: crop.plantedDate,
      expectedHarvestDate: crop.expectedHarvestDate,
      actualHarvestDate: crop.actualHarvestDate,
      plotSizeHectares: crop.plotSizeHectares
        ? Number(crop.plotSizeHectares)
        : null,
      status: crop.status,
      estimatedYieldKg: crop.estimatedYieldKg
        ? Number(crop.estimatedYieldKg)
        : null,
      actualYieldKg: crop.actualYieldKg
        ? Number(crop.actualYieldKg)
        : null,
    }));

    // Irrigation zone status
    const zoneStatus = irrigationZones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      sizeHectares: zone.sizeHectares
        ? Number(zone.sizeHectares)
        : null,
      cropType: zone.cropType,
      soilType: zone.soilType,
      isActive: zone.isActive,
      status: zone.status,
      lastIrrigated: zone.lastIrrigated,
      nextScheduled: zone.nextScheduled,
      moistureLevel: zone.moistureLevel
        ? Number(zone.moistureLevel)
        : null,
    }));

    return {
      farmerInfo: {
        id: farmerProfile.id,
        userId: farmerProfile.userId,
        fullName: `${user.firstName} ${user.lastName}`.trim() || user.phone,
        phone: user.phone,
        email: user.email,
        farmName: farmerProfile.farmName,
        location: farmerProfile.location,
        district: farmerProfile.district,
        sector: farmerProfile.sector,
        cell: farmerProfile.cell,
        village: farmerProfile.village,
        farmSizeHectares: farmerProfile.farmSizeHectares
          ? Number(farmerProfile.farmSizeHectares)
          : null,
        cooperativeInfo: farmerProfile.cooperative
          ? {
              id: farmerProfile.cooperative.id,
              name: farmerProfile.cooperative.name,
              registrationNumber:
                farmerProfile.cooperative.registrationNumber,
            }
          : null,
      },
      soilAnalysis: {
        totalReadings: soilReadings.length,
        latestReading:
          soilReadings.length > 0
            ? {
                id: soilReadings[0].id,
                moisturePercent: Number(
                  soilReadings[0].moisturePercent || 0
                ),
                temperatureCelsius: soilReadings[0].temperatureCelsius
                  ? Number(soilReadings[0].temperatureCelsius)
                  : null,
                phLevel: soilReadings[0].phLevel
                  ? Number(soilReadings[0].phLevel)
                  : null,
                nitrogenPpm: soilReadings[0].nitrogenPpm
                  ? Number(soilReadings[0].nitrogenPpm)
                  : null,
                phosphorusPpm: soilReadings[0].phosphorusPpm
                  ? Number(soilReadings[0].phosphorusPpm)
                  : null,
                potassiumPpm: soilReadings[0].potassiumPpm
                  ? Number(soilReadings[0].potassiumPpm)
                  : null,
                readingAt: soilReadings[0].readingAt,
              }
            : null,
        moistureTrend,
        averageMoisture:
          soilReadings.length > 0
            ? Number(
                (soilReadings.reduce(
                  (sum, r) => sum + Number(r.moisturePercent || 0),
                  0
                ) /
                  soilReadings.filter((r) => r.moisturePercent !== null)
                    .length)
                  .toFixed(2)
              )
            : 0,
      },
      activityAnalysis: {
        totalActivities: activities.length,
        recentActivities: activities
          .slice(0, 10)
          .map((a) => ({
            id: a.id,
            activityType: a.activityType,
            category: a.category,
            description: a.notes,
            quantity: a.quantity ? Number(a.quantity) : null,
            unit: a.unit,
            costRwf: a.costRwf ? Number(a.costRwf) : null,
            activityDate: a.activityDate,
          })),
        activityByType,
        monthlyActivity: Object.keys(monthlyActivity).map((month) => ({
          month,
          count: monthlyActivity[month],
        })),
      },
      cropAnalysis: cropInfo,
      irrigationAnalysis: {
        totalZones: irrigationZones.length,
        activeZones: irrigationZones.filter((z) => z.isActive).length,
        zones: zoneStatus,
      },
      recommendations: this.generateRecommendations(
        farmerProfile,
        soilReadings,
        activities,
        crops
      ),
    };
  }

  /**
   * Generate recommendations based on farmer data
   */
  private generateRecommendations(
    _farmerProfile: any,
    soilReadings: any[],
    activities: any[],
    crops: any[]
  ): Array<{
    type: string;
    priority: "low" | "medium" | "high";
    title: string;
    description: string;
  }> {
    const recommendations: Array<{
      type: string;
      priority: "low" | "medium" | "high";
      title: string;
      description: string;
    }> = [];

    // Soil moisture recommendations
    const recentReadings = soilReadings.slice(0, 5);
    const avgMoisture =
      recentReadings.length > 0
        ? recentReadings.reduce(
            (sum, r) => sum + Number(r.moisturePercent || 0),
            0
          ) / recentReadings.length
        : 0;

    if (avgMoisture < 30) {
      recommendations.push({
        type: "irrigation",
        priority: "high",
        title: "Low Soil Moisture Detected",
        description: `Average soil moisture is ${avgMoisture.toFixed(
          1
        )}%, which is below the optimal range. Consider increasing irrigation frequency.`,
      });
    } else if (avgMoisture > 70) {
      recommendations.push({
        type: "drainage",
        priority: "medium",
        title: "High Soil Moisture Detected",
        description: `Average soil moisture is ${avgMoisture.toFixed(
          1
        )}%, which is above the optimal range. Ensure proper drainage to prevent waterlogging.`,
      });
    }

    // Activity recommendations
    const activityTypes = activities.map((a) => a.activityType);
    const hasRecentPlanting =
      activityTypes.includes("planting") &&
      activities.some(
        (a) =>
          a.activityType === "planting" &&
          new Date(a.activityDate).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
      );

    if (!hasRecentPlanting && crops.length > 0) {
      const lastPlanting = activities
        .filter((a) => a.activityType === "planting")
        .sort(
          (a, b) =>
            new Date(b.activityDate).getTime() -
            new Date(a.activityDate).getTime()
        )[0];

      if (
        !lastPlanting ||
        new Date(lastPlanting.activityDate).getTime() <
          Date.now() - 60 * 24 * 60 * 60 * 1000
      ) {
        recommendations.push({
          type: "planting",
          priority: "medium",
          title: "Consider Planting Season Preparation",
          description: "No recent planting activity detected. Review planting schedule and prepare for next season.",
        });
      }
    }

    // Crop-specific recommendations
    crops.forEach((crop) => {
      if (crop.status === "planted" && !crop.actualHarvestDate) {
        const daysPlanted =
          (Date.now() - new Date(crop.plantedDate).getTime()) /
          (1000 * 60 * 60 * 24);

        // Example: If maize has been planted for over 90 days, check readiness
        if (
          crop.crop.nameEn.toLowerCase().includes("maize") &&
          daysPlanted > 90
        ) {
          recommendations.push({
            type: "harvest",
            priority: "medium",
            title: "Check Maize Crop Readiness",
            description: `Maize planted ${Math.floor(
              daysPlanted
            )} days ago may be approaching harvest time. Monitor for maturity signs.`,
          });
        }
      }
    });

    // General recommendation if none generated
    if (recommendations.length === 0) {
      recommendations.push({
        type: "general",
        priority: "low",
        title: "Regular Monitoring Recommended",
        description: "All metrics appear within normal ranges. Continue regular monitoring and scheduled activities.",
      });
    }

    return recommendations;
  }

  /**
   * Get performance comparison of farmers assigned to this officer
   * Similar to cooperative performance but for officer's assigned farmers
   */
  async getAssignedFarmersPerformance(
    extensionOfficerId: string,
    options: {
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {}
  ) {
    // Verify the user is an extension officer
    const officerProfile = await prisma.extensionOfficerProfile.findUnique({
      where: { userId: extensionOfficerId },
    });

    if (!officerProfile) {
      throw new Error("Extension officer profile not found");
    }

    // Get farmers assigned to this officer
    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: { extensionOfficerId },
      include: {
        farmer: {
          include: {
            farmerProfile: {
              include: {
                cooperative: true,
                soilReadings: {
                  where: options.startDate || options.endDate
                    ? {
                        readingAt: {
                          gte: options.startDate,
                          lte: options.endDate,
                        },
                      }
                    : undefined,
                },
                farmActivities: {
                  where: options.startDate || options.endDate
                    ? {
                        activityDate: {
                          gte: options.startDate,
                          lte: options.endDate,
                        },
                      }
                    : undefined,
                },
              },
            },
          },
        },
      },
    });

    if (assignments.length === 0) {
      return {
        rankings: [],
        summary: {
          totalFarmers: 0,
          avgScore: 0,
          topPerformer: null,
          dateRange: {
            start: options.startDate,
            end: options.endDate,
          },
        },
      };
    }

    // Calculate performance scores for each farmer
    const farmerScores = await Promise.all(
      assignments.map(async (assignment) => {
        if (!assignment.farmer.farmerProfile) return null;
        const farmerProfile = assignment.farmer.farmerProfile;
        const user = assignment.farmer as any;

        // Calculate soil moisture score (0-25 points)
        const soilReadings = farmerProfile.soilReadings || [];
        const validMoistureReadings = soilReadings.filter(
          (r) => r.moisturePercent !== null
        );
        let soilMoistureScore = 0;
        if (validMoistureReadings.length > 0) {
          const avgMoisture =
            validMoistureReadings.reduce(
              (sum, r) => sum + Number(r.moisturePercent),
              0
            ) / validMoistureReadings.length;
          // Optimal moisture range: 40-60%
          if (avgMoisture >= 40 && avgMoisture <= 60) {
            soilMoistureScore = 25; // Perfect score
          } else if (avgMoisture >= 30 && avgMoisture <= 70) {
            // Linear decrease from 25 to 0 as we move away from optimal range
            soilMoistureScore =
              25 -
              Math.abs(avgMoisture - 50) * (25 / 20); // 20 points deviation max
          }
          // Ensure score doesn't go below 0
          soilMoistureScore = Math.max(0, soilMoistureScore);
        }

        // Calculate activity score (0-25 points)
        const activities = farmerProfile.farmActivities || [];
        const activityScore = Math.min(25, activities.length * 2); // 2 points per activity, max 25

        // Calculate irrigation score (0-25 points)
        const irrigationActivities = activities.filter((a) =>
          a.activityType.toLowerCase().includes("irrigation")
        );
        let irrigationScore = 0;
        if (irrigationActivities.length > 0) {
          // Score based on frequency and consistency
          irrigationScore = Math.min(25, irrigationActivities.length * 3); // 3 points per irrigation, max 25
        }

        // Calculate crop management score (0-25 points)
        // farmerCrops not included in this query - crop score skipped
        const crops: any[] = [];
        let cropScore = 0;
        if (crops.length > 0) {
          // Points for having crops planted
          cropScore = Math.min(15, crops.length * 3); // 3 points per crop type, max 15

          // Bonus points for expected yield data
          const cropsWithYieldEstimate = crops.filter(
            (c: any) => c.estimatedYieldKg !== null
          );
          if (cropsWithYieldEstimate.length > 0) {
            cropScore += Math.min(10, cropsWithYieldEstimate.length * 2); // 2 points per crop with yield estimate, max 10
          }
        }

        const overallScore =
          soilMoistureScore + activityScore + irrigationScore + cropScore;

        return {
          id: farmerProfile.id,
          userId: farmerProfile.userId,
          fullName: user.fullName?.trim() || user.phone,
          farmName: farmerProfile.farmName,
          district: farmerProfile.district,
          cooperativeId: farmerProfile.cooperativeId,
          cooperativeName:
            farmerProfile.cooperative?.name ||
            "Not assigned to cooperative",
          soilMoistureAvg:
            validMoistureReadings.length > 0
              ? Number(
                  (validMoistureReadings.reduce(
                    (sum, r) => sum + Number(r.moisturePercent),
                    0
                  ) / validMoistureReadings.length).toFixed(2)
                )
              : null,
          activitiesCount: activities.length,
          irrigationCount: irrigationActivities.length,
          cropsCount: crops.length,
          overallScore: Number(overallScore.toFixed(2)),
        };
      })
    );

    const validScores = farmerScores.filter(f => f !== null) as NonNullable<typeof farmerScores[0]>[];

    // Sort by overall score descending
    validScores.sort((a, b) => b.overallScore - a.overallScore);

    // Apply limit if specified
    const limitedScores =
      options.limit && options.limit > 0
        ? validScores.slice(0, options.limit)
        : validScores;

    // Calculate summary statistics
    const totalFarmers = validScores.length;
    const avgScore =
      totalFarmers > 0
        ? validScores.reduce((sum, f) => sum + f.overallScore, 0) /
          totalFarmers
        : 0;
    const topPerformer = totalFarmers > 0 ? validScores[0] : null;

    return {
      rankings: limitedScores,
      summary: {
        totalFarmers,
        avgScore: Number(avgScore.toFixed(2)),
        topPerformer,
        dateRange: {
          start: options.startDate,
          end: options.endDate,
        },
      },
    };
  }

  /**
   * Get advisories created by this officer
   */
  async getOfficerAdvisories(officerId: string) {
    return prisma.alert.findMany({
      where: {
        createdById: officerId,
        alertType: "advisory",
      },
      include: {
        farmer: {
          select: {
            id: true,
            farmName: true,
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Create an advisory for a farmer
   */
  async createAdvisory(
    officerId: string,
    data: {
      farmerIds?: string[];
      title: string;
      message: string;
      recommendation?: string;
      severity?: "info" | "warning" | "critical";
    }
  ) {
    // Get all assigned farmer profiles
    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: { extensionOfficerId: officerId },
      include: {
        farmer: {
          select: { farmerProfile: { select: { id: true } } },
        },
      },
    });

    let targetProfileIds = assignments
      .map((a) => a.farmer.farmerProfile?.id)
      .filter(Boolean) as string[];

    if (data.farmerIds && data.farmerIds.length > 0) {
       // Filter to only the requested ones, ensuring they are assigned
       // Allow matching by either FarmerProfile ID or User ID
       targetProfileIds = assignments
         .filter(a => data.farmerIds!.includes(a.farmerId) || (a.farmer.farmerProfile && data.farmerIds!.includes(a.farmer.farmerProfile.id)))
         .map(a => a.farmer.farmerProfile?.id)
         .filter(Boolean) as string[];
         
       if (targetProfileIds.length === 0) {
         throw new Error("None of the specified farmers are assigned to this officer");
       }
    }

    if (targetProfileIds.length === 0) {
      throw new Error("No assigned farmers found to send advisory to");
    }

    const alerts = targetProfileIds.map(profileId => ({
        farmerId: profileId,
        alertType: "advisory" as const,
        severity: data.severity || "info",
        title: data.title,
        message: data.message,
        recommendation: data.recommendation,
        createdById: officerId,
    }));

    await prisma.alert.createMany({ data: alerts });
    
    return { success: true, count: alerts.length };
  }

  /**
   * Get risks (pest, disease, weather) for farmers assigned to this officer
   */
  async getOfficerRisks(officerId: string) {
    const assignments = await prisma.extensionOfficerAssignment.findMany({
      where: {
        extensionOfficerId: officerId,
      },
      include: {
        farmer: {
          select: { farmerProfile: { select: { id: true } } },
        },
      },
    });

    const farmerProfileIds = assignments
      .map((a) => a.farmer.farmerProfile?.id)
      .filter(Boolean) as string[];

    return prisma.alert.findMany({
      where: {
        farmerId: { in: farmerProfileIds },
        alertType: { in: ["pest", "disease", "weather"] },
      },
      include: {
        farmer: {
          select: {
            id: true,
            farmName: true,
            user: {
              select: {
                fullName: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}