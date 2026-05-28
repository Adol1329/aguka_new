import { prisma } from "../prisma.js";

export const cooperativeService = {
  /**
   * Get farmer performance comparison for a cooperative
   * @param cooperativeId The ID of the cooperative
   * @param start Start date for the period (optional, defaults to 30 days ago)
   * @param end End date for the period (optional, defaults to now)
   * @returns Performance data including rankings, top performer, bottom performer, and average score
   */
  async getFarmerPerformanceComparison(cooperativeId: string, start?: Date, end?: Date) {
    // Set default date range to last 30 days if not provided
    const endDate = end || new Date();
    const startDate = start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all active members of the cooperative
    const members = await prisma.cooperativeMember.findMany({
      where: { 
        cooperativeId,
        status: "active"
      },
      include: {
        user: {
          include: {
            farmerProfile: true
          }
        }
      }
    });

    // For each farmer, calculate performance metrics
    const farmerPerformances = await Promise.all(
      members.map(async (member) => {
        const farmerId = member.user.farmerProfile?.id;
        
        if (!farmerId) {
          return null;
        }

        // Get soil readings in the date range
        const soilReadings = await prisma.soilReading.findMany({
          where: {
            farmerId,
            readingAt: {
              gte: startDate,
              lte: endDate
            }
          }
        });

        // Calculate average soil moisture
        const soilMoistureAvg = soilReadings.length > 0 
          ? soilReadings.reduce((sum, reading) => sum + Number(reading.moisturePercent || 0), 0) / soilReadings.length
          : null;

        // Count farm activities in the date range
        const activitiesCount = await prisma.farmActivity.count({
          where: {
            farmerId,
            activityDate: {
              gte: startDate,
              lte: endDate
            }
          }
        });

        // Count irrigation logs in the date range
        const irrigationCount = await prisma.irrigationLog.count({
          where: {
            farmerId,
            executedAt: {
              gte: startDate,
              lte: endDate
            }
          }
        });

        // Calculate overall score (0-100 scale)
        // Formula: 40% soil moisture (normalized to 0-40 points) + 30% activity count (normalized) + 30% irrigation count (normalized)
        // Soil moisture: 0-100% -> 0-40 points
        // Activities: 0-20+ -> 0-30 points (cap at 20 for 30 points)
        // Irrigation: 0-10+ -> 0-30 points (cap at 10 for 30 points)
        
        let score = 0;
        
        if (soilMoistureAvg !== null) {
          // Normalize soil moisture (0-100%) to points (0-40)
          score += Math.min(40, (soilMoistureAvg / 100) * 40);
        }
        
        // Activity points (0-20 activities = 0-30 points)
        score += Math.min(30, activitiesCount * 1.5);
        
        // Irrigation points (0-10 irrigation logs = 0-30 points)
        score += Math.min(30, irrigationCount * 3);
        
        // Ensure score is between 0-100
        score = Math.max(0, Math.min(100, score));

        return {
          id: member.id,
          userId: member.userId,
          cooperativeId: member.cooperativeId,
          fullName: member.user.farmerProfile?.fullName || member.user.phone || 'Unknown Farmer',
          district: member.user.farmerProfile?.district || '',
          farmName: member.user.farmerProfile?.farmName || null,
          soilMoistureAvg: soilMoistureAvg !== null ? Number(soilMoistureAvg.toFixed(2)) : null,
          activitiesCount,
          irrigationCount,
          overallScore: Number(score.toFixed(2))
        };
      })
    );

    // Filter out null results and sort by score descending
    const validPerformances = farmerPerformances
      .filter((p): p is NonNullable<typeof p> => p !== null)
      .sort((a, b) => b.overallScore - a.overallScore);

    // Calculate summary statistics
    const totalFarmers = validPerformances.length;
    const averageScore = totalFarmers > 0 
      ? validPerformances.reduce((sum, farmer) => sum + farmer.overallScore, 0) / totalFarmers
      : 0;
    
    const topPerformer = totalFarmers > 0 ? validPerformances[0] : null;
    const bottomPerformer = totalFarmers > 0 ? validPerformances[totalFarmers - 1] : null;

    return {
      rankings: validPerformances,
      topPerformer,
      bottomPerformer,
      averageScore: Number(averageScore.toFixed(2))
    };
  }
};

export default cooperativeService;