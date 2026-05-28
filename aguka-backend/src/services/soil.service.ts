import { prisma } from "../prisma.js";

export class SoilService {
  async getReadings(
    farmerId?: string,
    params: { startDate?: Date; endDate?: Date; limit?: number } = {},
  ) {
    const limit = params.limit ?? 100;

    const where: Record<string, any> = {};
    if (farmerId) {
      where.farmerId = farmerId;
    }

    if (params.startDate) {
      where.readingAt = {
        ...((where.readingAt as object) || {}),
        gte: params.startDate,
      };
    }

    if (params.endDate) {
      where.readingAt = {
        ...((where.readingAt as object) || {}),
        lte: params.endDate,
      };
    }

    const readings = await prisma.soilReading.findMany({
      where,
      include: { sensor: true },
      orderBy: { readingAt: "desc" },
      take: limit,
    });

    return readings.map((r) => this.formatReading(r));
  }

  async getCurrentStatus(farmerId: string) {
    const latestReading = await prisma.soilReading.findFirst({
      where: { farmerId },
      orderBy: { readingAt: "desc" },
    });

    if (!latestReading) {
      // Simulation Fallback: If no real data, generate structured simulation
      return {
        id: "sim_latest",
        moisture: 45.0,
        temperature: 24.0,
        ph: 6.5,
        nitrogen: 80,
        phosphorus: 40,
        potassium: 150,
        source: "simulation",
        recordedAt: new Date().toISOString(),
        status: "Fair",
      };
    }

    const activeCrop = await prisma.farmerCrop.findFirst({
      where: {
        farmerId,
        status: "planted",
      },
      include: { crop: true },
    });

    const healthScore = this.calculateSoilHealthScore(
      latestReading,
      activeCrop?.crop,
    );

    return {
      ...this.formatReading(latestReading),
      healthScore,
      status: this.getSoilStatus(healthScore),
      activeCrop: activeCrop?.crop.nameEn || "None",
      recommendation: this.getSoilRecommendation(
        healthScore,
        latestReading,
        activeCrop?.crop,
      ),
    };
  }

  async addReading(
    farmerId: string,
    data: {
      sensorId?: string;
      moisturePercent: number;
      temperatureCelsius?: number;
      soilTemperatureCelsius?: number;
      phLevel?: number;
      nitrogenPpm?: number;
      phosphorusPpm?: number;
      potassiumPpm?: number;
    },
  ) {
    const reading = await prisma.soilReading.create({
      data: {
        sensorId: data.sensorId,
        farmerId,
        moisturePercent: data.moisturePercent,
        temperatureCelsius: data.temperatureCelsius,
        soilTemperatureCelsius: data.soilTemperatureCelsius,
        phLevel: data.phLevel,
        nitrogenPpm: data.nitrogenPpm,
        phosphorusPpm: data.phosphorusPpm,
        potassiumPpm: data.potassiumPpm,
      },
    });

    return this.formatReading(reading);
  }

  async getSoilAlerts(farmerId: string) {
    const latest = await prisma.soilReading.findFirst({
      where: { farmerId },
      orderBy: { readingAt: "desc" },
    });

    if (!latest) {
      return [];
    }

    const activeCrop = await prisma.farmerCrop.findFirst({
      where: { farmerId, status: "planted" },
      include: { crop: true },
    });

    const crop = activeCrop?.crop;
    const alerts: Array<{
      type: string;
      severity: string;
      title: string;
      message: string;
    }> = [];

    const moisture = Number(latest.moisturePercent);
    if (moisture < 20) {
      alerts.push({
        type: "soil",
        severity: "critical",
        title: "Low Soil Moisture",
        message: `Moisture at ${moisture}%. Immediate irrigation recommended.`,
      });
    } else if (moisture < 30) {
      alerts.push({
        type: "soil",
        severity: "warning",
        title: "Low Soil Moisture",
        message: `Moisture at ${moisture}%. Consider irrigation soon.`,
      });
    }

    if (latest.phLevel) {
      const ph = Number(latest.phLevel);
      const minPh = crop?.optimalPhMin ? Number(crop.optimalPhMin) : 5.5;
      const maxPh = crop?.optimalPhMax ? Number(crop.optimalPhMax) : 8.0;

      if (ph < minPh) {
        alerts.push({
          type: "soil",
          severity: "warning",
          title: "Acidic Soil",
          message: `pH at ${ph} is below optimal (${minPh}) for ${crop?.nameEn || "crops"}. Consider adding lime.`,
        });
      } else if (ph > maxPh) {
        alerts.push({
          type: "soil",
          severity: "warning",
          title: "Alkaline Soil",
          message: `pH at ${ph} is above optimal (${maxPh}) for ${crop?.nameEn || "crops"}. Consider adding sulfur.`,
        });
      }
    }

    return alerts;
  }

  async getRecommendations(farmerId: string) {
    const latest = await prisma.soilReading.findFirst({
      where: { farmerId },
      orderBy: { readingAt: "desc" },
    });

    if (!latest) {
      return [];
    }

    const activeCrop = await prisma.farmerCrop.findFirst({
      where: { farmerId, status: "planted" },
      include: { crop: true },
    });

    const crop = activeCrop?.crop;
    const recommendations: string[] = [];

    if (Number(latest.moisturePercent) < 30) {
      recommendations.push("Irrigate with 10-15mm of water today");
    }

    const nitrogenReq = crop?.nitrogenRequirementKgha
      ? Number(crop.nitrogenRequirementKgha)
      : 50;
    if (latest.nitrogenPpm && Number(latest.nitrogenPpm) < nitrogenReq) {
      recommendations.push(
        `Apply nitrogen fertilizer for ${crop?.nameEn || "crops"} (e.g., Urea)`,
      );
    }

    const phMin = crop?.optimalPhMin ? Number(crop.optimalPhMin) : 6.0;
    if (latest.phLevel && Number(latest.phLevel) < phMin) {
      recommendations.push(
        `Apply agricultural lime to raise pH to ${phMin} for ${crop?.nameEn || "crops"}`,
      );
    }

    return recommendations;
  }

  private calculateSoilHealthScore(reading: any, crop?: any) {
    let score = 70;

    if (reading.moisturePercent) {
      const moisture = Number(reading.moisturePercent);
      if (moisture >= 30 && moisture <= 60) {
        score += 10;
      } else if (moisture >= 20 && moisture <= 70) {
        score += 5;
      } else {
        score -= 10;
      }
    }

    if (reading.phLevel) {
      const ph = Number(reading.phLevel);
      const minPh = crop?.optimalPhMin ? Number(crop.optimalPhMin) : 6.0;
      const maxPh = crop?.optimalPhMax ? Number(crop.optimalPhMax) : 7.5;

      if (ph >= minPh && ph <= maxPh) {
        score += 15;
      } else if (ph >= minPh - 0.5 && ph <= maxPh + 0.5) {
        score += 5;
      } else {
        score -= 10;
      }
    }

    if (reading.nitrogenPpm) {
      const nitrogen = Number(reading.nitrogenPpm);
      const req = crop?.nitrogenRequirementKgha
        ? Number(crop.nitrogenRequirementKgha)
        : 50;
      if (nitrogen >= req) {
        score += 5;
      } else {
        score -= 5;
      }
    }

    return Math.max(0, Math.min(100, score));
  }

  private getSoilStatus(score: number) {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  }

  private getSoilRecommendation(score: number, reading: any, crop?: any) {
    if (score >= 75) {
      return `Soil condition is good for ${crop?.nameEn || "your crops"}. Maintain current practices.`;
    }

    const recommendations: string[] = [];

    if (reading.moisturePercent && Number(reading.moisturePercent) < 30) {
      recommendations.push("Increase irrigation frequency");
    }

    if (reading.phLevel) {
      const ph = Number(reading.phLevel);
      const minPh = crop?.optimalPhMin ? Number(crop.optimalPhMin) : 6.0;
      const maxPh = crop?.optimalPhMax ? Number(crop.optimalPhMax) : 7.5;

      if (ph < minPh) {
        recommendations.push(
          `Apply lime to raise pH for ${crop?.nameEn || "optimal growth"}`,
        );
      } else if (ph > maxPh) {
        recommendations.push(
          `Apply sulfur to lower pH for ${crop?.nameEn || "optimal growth"}`,
        );
      }
    }

    if (!recommendations.length) {
      return "Apply balanced fertilizer to improve soil health";
    }

    return recommendations.join(". ");
  }

  private formatReading(reading: any) {
    return {
      id: reading.id,
      sensorId: reading.sensorId,
      moisture: reading.moisturePercent,
      temperature: reading.temperatureCelsius,
      soilTemperature: reading.soilTemperatureCelsius,
      ph: reading.phLevel,
      nitrogen: reading.nitrogenPpm,
      phosphorus: reading.phosphorusPpm,
      potassium: reading.potassiumPpm,
      readingAt: reading.readingAt?.toISOString(),
    };
  }
}

export const soilService = new SoilService();
