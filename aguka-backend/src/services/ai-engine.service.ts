/**
 * Aguka Smart Farming Kit — Rule-Based AI Recommendation Engine
 *
 * Implements intelligent agricultural advisory logic using threshold analysis
 * and rule-based inference. No machine learning or neural networks.
 *
 * Modules:
 *  A. Smart Irrigation Recommendation
 *  B. Weather Advisory Engine
 *  C. Pest & Disease Risk Detection
 *  D. Crop Health Analysis
 *  E. Cooperative Manager AI Analytics
 */

import { prisma } from "../prisma.js";
import { logger } from "../utils/logger.js";

// ─── Shared Types ─────────────────────────────────────────────────────────────

export type Severity = "low" | "medium" | "high" | "critical";
export type Category =
  | "irrigation"
  | "weather"
  | "pest_disease"
  | "crop_health"
  | "performance";

export interface AIRecommendation {
  id?: string;
  farmerId: string;
  category: Category;
  severity: Severity;
  title: string;
  message: string;
  recommendation: string;
  actionRequired: boolean;
  details: Record<string, unknown>;
  generatedAt: Date;
  expiresAt?: Date;
  /** 0-100 — engine confidence in the rule match */
  confidence: number;
}

export interface SensorSnapshot {
  soilMoisture: number;        // %
  temperature: number;         // °C
  humidity: number;            // %
  rainfallProbability: number; // %
  rainfall3DayMm: number;      // mm expected over 3 days
  cropType: string;
  farmSize: number;            // ha
  soilPh?: number;
  soilNitrogen?: number;       // ppm
}

// ─── Helper Utilities ─────────────────────────────────────────────────────────

function expireIn(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

function hoursAgo(date: Date): number {
  return (Date.now() - date.getTime()) / (1000 * 60 * 60);
}

// ─── Module A: Irrigation Recommendation ─────────────────────────────────────

function analyzeIrrigation(snap: SensorSnapshot): AIRecommendation | null {
  const { soilMoisture, rainfallProbability, rainfall3DayMm, cropType, farmerId } =
    snap as SensorSnapshot & { farmerId: string };

  // Rule A-1: Critically dry soil + no rain coming
  if (soilMoisture < 20 && rainfallProbability < 30) {
    return {
      farmerId,
      category: "irrigation",
      severity: "critical",
      title: "🚨 Critical Soil Moisture — Immediate Irrigation Required",
      message: `Soil moisture is critically low at ${soilMoisture.toFixed(1)}%. Rain probability is only ${rainfallProbability}%. Crops face severe water stress.`,
      recommendation: `Irrigate immediately for at least ${irrigationDuration(soilMoisture, cropType)} minutes. Schedule for early morning (05:00–07:00) to minimise evaporation.`,
      actionRequired: true,
      confidence: 95,
      details: { soilMoisture, rainfallProbability, rainfall3DayMm, cropType, threshold: 20 },
      generatedAt: new Date(),
      expiresAt: expireIn(6),
    };
  }

  // Rule A-2: Low soil moisture + low rain
  if (soilMoisture < 35 && rainfallProbability < 40) {
    return {
      farmerId,
      category: "irrigation",
      severity: "high",
      title: "⚠️ Low Soil Moisture — Irrigation Recommended Within 24 Hours",
      message: `Soil moisture is ${soilMoisture.toFixed(1)}% — below the optimal range (35–70%). Rain probability is ${rainfallProbability}%. Without irrigation, yield loss may occur.`,
      recommendation: `Schedule irrigation within 24 hours. Apply ${irrigationDuration(soilMoisture, cropType)} minutes of irrigation. Monitor moisture levels after application.`,
      actionRequired: true,
      confidence: 88,
      details: { soilMoisture, rainfallProbability, rainfall3DayMm, cropType },
      generatedAt: new Date(),
      expiresAt: expireIn(12),
    };
  }

  // Rule A-3: Rain expected — hold irrigation
  if (rainfallProbability > 75 && rainfall3DayMm > 10) {
    return {
      farmerId,
      category: "irrigation",
      severity: "low",
      title: "🌧️ Skip Irrigation — Rain Expected",
      message: `Heavy rainfall (${rainfall3DayMm.toFixed(1)}mm) is expected with ${rainfallProbability}% probability. Irrigation at this time would waste water and may cause waterlogging.`,
      recommendation: "Postpone all irrigation for 48–72 hours. Check soil drainage to prevent waterlogging.",
      actionRequired: false,
      confidence: 90,
      details: { soilMoisture, rainfallProbability, rainfall3DayMm },
      generatedAt: new Date(),
      expiresAt: expireIn(24),
    };
  }

  // Rule A-4: Optimal conditions
  if (soilMoisture >= 35 && soilMoisture <= 70) {
    return {
      farmerId,
      category: "irrigation",
      severity: "low",
      title: "✅ Soil Moisture Optimal — No Irrigation Needed",
      message: `Soil moisture is at ${soilMoisture.toFixed(1)}%, which is within the optimal range for most crops. Continue monitoring.`,
      recommendation: "No irrigation needed at this time. Schedule your next soil moisture check in 48 hours.",
      actionRequired: false,
      confidence: 85,
      details: { soilMoisture, rainfallProbability },
      generatedAt: new Date(),
      expiresAt: expireIn(24),
    };
  }

  return null;
}

function irrigationDuration(moisture: number, crop: string): number {
  const deficit = Math.max(0, 50 - moisture); // target 50%
  const cropFactor: Record<string, number> = {
    maize: 1.2,
    rice: 1.5,
    beans: 0.9,
    cassava: 0.7,
    banana: 1.1,
    wheat: 1.0,
    sorghum: 0.8,
  };
  const factor = cropFactor[crop?.toLowerCase()] ?? 1.0;
  return Math.round((deficit * factor * 2) / 10) * 10 || 20; // round to 10min
}

// ─── Module B: Weather Advisory Engine ───────────────────────────────────────

function analyzeWeather(snap: SensorSnapshot): AIRecommendation | null {
  const { temperature, humidity, rainfallProbability, rainfall3DayMm, farmerId } =
    snap as SensorSnapshot & { farmerId: string };

  // Rule B-1: Heavy rainfall warning
  if (rainfallProbability > 80 && rainfall3DayMm > 25) {
    return {
      farmerId,
      category: "weather",
      severity: "high",
      title: "⛈️ Heavy Rainfall Warning",
      message: `Heavy rainfall is expected (${rainfall3DayMm.toFixed(0)}mm over 3 days, ${rainfallProbability}% probability). Risk of crop damage and soil erosion.`,
      recommendation: "Reduce or halt irrigation immediately. Ensure drainage channels are clear. Protect vulnerable crops with appropriate cover. Postpone any fertilizer application.",
      actionRequired: true,
      confidence: 92,
      details: { rainfallProbability, rainfall3DayMm, temperature },
      generatedAt: new Date(),
      expiresAt: expireIn(12),
    };
  }

  // Rule B-2: Drought risk
  if (rainfallProbability < 15 && temperature > 28) {
    return {
      farmerId,
      category: "weather",
      severity: "high",
      title: "☀️ Drought Risk Detected",
      message: `Rain probability is only ${rainfallProbability}% with high temperature (${temperature.toFixed(1)}°C). Drought conditions are developing that could severely impact crop productivity.`,
      recommendation: "Activate water conservation measures. Irrigate in early morning only. Apply mulching to reduce evaporation. Consider drought-tolerant varieties for the next season.",
      actionRequired: true,
      confidence: 87,
      details: { rainfallProbability, temperature, rainfall3DayMm },
      generatedAt: new Date(),
      expiresAt: expireIn(18),
    };
  }

  // Rule B-3: Heat stress
  if (temperature > 35) {
    return {
      farmerId,
      category: "weather",
      severity: "high",
      title: "🌡️ Extreme Heat Stress Alert",
      message: `Temperature is critically high at ${temperature.toFixed(1)}°C. Most crops experience severe heat stress above 35°C, leading to wilting and yield loss.`,
      recommendation: "Increase irrigation frequency. Apply shade nets to sensitive crops. Avoid field work during peak heat (10:00–16:00). Monitor crop health daily.",
      actionRequired: true,
      confidence: 94,
      details: { temperature, humidity },
      generatedAt: new Date(),
      expiresAt: expireIn(8),
    };
  }

  // Rule B-4: Moderate heat advisory
  if (temperature > 30 && temperature <= 35) {
    return {
      farmerId,
      category: "weather",
      severity: "medium",
      title: "🌤️ Heat Advisory — Monitor Crop Conditions",
      message: `Temperature is elevated at ${temperature.toFixed(1)}°C. Heat-sensitive crops may begin to show stress symptoms.`,
      recommendation: "Monitor crops for wilting. Consider additional irrigation if soil moisture drops below 40%.",
      actionRequired: false,
      confidence: 78,
      details: { temperature, humidity },
      generatedAt: new Date(),
      expiresAt: expireIn(12),
    };
  }

  return null;
}

// ─── Module C: Pest & Disease Risk Detection ─────────────────────────────────

function analyzePestRisk(snap: SensorSnapshot): AIRecommendation | null {
  const { humidity, temperature, cropType, farmerId } =
    snap as SensorSnapshot & { farmerId: string };

  // Rule C-1: High fungal disease risk
  if (humidity > 85 && temperature > 25 && temperature < 35) {
    return {
      farmerId,
      category: "pest_disease",
      severity: "high",
      title: "🦠 High Risk of Fungal Disease Outbreak",
      message: `Humidity is ${humidity.toFixed(1)}% and temperature is ${temperature.toFixed(1)}°C — ideal conditions for fungal disease spread in ${cropType} crops. Common threats include blight, rust, and powdery mildew.`,
      recommendation: "Inspect crops immediately for disease symptoms. Apply appropriate fungicide preventively. Improve field ventilation by reducing canopy density. Avoid overhead irrigation.",
      actionRequired: true,
      confidence: 91,
      details: { humidity, temperature, cropType, riskFactors: ["high humidity", "warm temperature"] },
      generatedAt: new Date(),
      expiresAt: expireIn(12),
    };
  }

  // Rule C-2: Pest outbreak risk (hot and dry — aphids, mites)
  if (humidity < 40 && temperature > 28) {
    return {
      farmerId,
      category: "pest_disease",
      severity: "medium",
      title: "🐛 Pest Outbreak Risk — Dry & Warm Conditions",
      message: `Low humidity (${humidity.toFixed(1)}%) and high temperature (${temperature.toFixed(1)}°C) favor aphid and spider mite outbreaks in ${cropType}.`,
      recommendation: "Scout crops for pest signs (leaf curling, yellowing). Apply neem oil or insecticidal soap as preventive treatment. Introduce natural predators if organically farming.",
      actionRequired: true,
      confidence: 82,
      details: { humidity, temperature, cropType, riskFactors: ["low humidity", "heat"] },
      generatedAt: new Date(),
      expiresAt: expireIn(24),
    };
  }

  // Rule C-3: Crop-specific maize borer risk
  if (cropType?.toLowerCase().includes("maize") && temperature > 22 && humidity > 60) {
    return {
      farmerId,
      category: "pest_disease",
      severity: "medium",
      title: "🌽 Maize Stalk Borer Risk",
      message: `Warm nights (${temperature.toFixed(1)}°C) and moderate humidity (${humidity.toFixed(1)}%) create favourable conditions for Busseola fusca (maize stalk borer) activity.`,
      recommendation: "Monitor for dead-heart symptoms in young plants and frass on older plants. Apply biological control (Bt) or targeted insecticide at the base of plants.",
      actionRequired: false,
      confidence: 75,
      details: { humidity, temperature, cropType },
      generatedAt: new Date(),
      expiresAt: expireIn(24),
    };
  }

  return null;
}

// ─── Module D: Crop Health Analysis ─────────────────────────────────────────

function analyzeCropHealth(snap: SensorSnapshot): AIRecommendation | null {
  const { cropType, soilMoisture, temperature, humidity, soilPh, soilNitrogen, farmerId } =
    snap as SensorSnapshot & { farmerId: string };

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Soil pH analysis
  if (soilPh !== undefined) {
    if (soilPh < 5.5) {
      issues.push(`soil is too acidic (pH ${soilPh.toFixed(1)})`);
      recommendations.push("Apply agricultural lime (2–3 t/ha) to raise soil pH above 6.0.");
    } else if (soilPh > 7.5) {
      issues.push(`soil is too alkaline (pH ${soilPh.toFixed(1)})`);
      recommendations.push("Apply sulfur or acidifying fertilizer to lower pH.");
    }
  }

  // Nitrogen deficiency
  if (soilNitrogen !== undefined && soilNitrogen < 15) {
    issues.push(`low nitrogen (${soilNitrogen.toFixed(0)} ppm)`);
    recommendations.push("Apply nitrogen-rich fertilizer (urea/CAN) at 50–75 kg/ha.");
  }

  // Crop-specific temperature stress
  const cropTempLimits: Record<string, [number, number]> = {
    maize: [10, 30],
    beans: [15, 28],
    banana: [18, 32],
    wheat: [8, 28],
    cassava: [20, 34],
    sorghum: [15, 34],
  };
  const limits = cropTempLimits[cropType?.toLowerCase() ?? ""] ?? [10, 32];
  if (temperature > limits[1]) {
    issues.push(`heat stress for ${cropType} (${temperature.toFixed(1)}°C > ${limits[1]}°C limit)`);
    recommendations.push(`Apply shade netting and increase irrigation frequency for ${cropType}.`);
  } else if (temperature < limits[0]) {
    issues.push(`cold stress risk for ${cropType} (${temperature.toFixed(1)}°C < ${limits[0]}°C minimum)`);
    recommendations.push(`Consider mulching to retain soil heat for ${cropType}.`);
  }

  if (issues.length === 0) return null;

  const severity: Severity = issues.length >= 3 ? "high" : issues.length >= 2 ? "medium" : "low";

  return {
    farmerId,
    category: "crop_health",
    severity,
    title: `🌱 Crop Health Issues Detected — ${cropType}`,
    message: `Analysis identified ${issues.length} issue(s) affecting your ${cropType}: ${issues.join(", ")}.`,
    recommendation: recommendations.join(" "),
    actionRequired: severity !== "low",
    confidence: 80,
    details: { cropType, soilMoisture, temperature, humidity, soilPh, soilNitrogen, issues },
    generatedAt: new Date(),
    expiresAt: expireIn(36),
  };
}

// ─── Module E: Cooperative Performance Analysis ───────────────────────────────

export interface FarmerPerformanceData {
  farmerId: string;
  farmerName: string;
  productivity: number;       // 0–100 score
  irrigationFrequency: number; // days per week
  farmSize: number;
  lastActivityDays: number;   // days since last system activity
  cropCount: number;
}

function analyzeCooperativePerformance(farmers: FarmerPerformanceData[]): AIRecommendation[] {
  if (farmers.length === 0) return [];

  const results: AIRecommendation[] = [];
  const avgProductivity = farmers.reduce((s, f) => s + f.productivity, 0) / farmers.length;
  const threshold = avgProductivity * 0.6; // 40% below average = underperforming

  for (const farmer of farmers) {
    // Rule E-1: Underperforming farm
    if (farmer.productivity < threshold) {
      results.push({
        farmerId: farmer.farmerId,
        category: "performance",
        severity: "high",
        title: `📉 Underperforming Farm — ${farmer.farmerName}`,
        message: `${farmer.farmerName}'s productivity score (${farmer.productivity.toFixed(0)}) is significantly below the cooperative average (${avgProductivity.toFixed(0)}). Immediate intervention is recommended.`,
        recommendation: "Schedule an extension officer visit within 7 days. Review irrigation practices, crop selection, and soil health. Provide targeted training resources.",
        actionRequired: true,
        confidence: 88,
        details: { productivity: farmer.productivity, avg: avgProductivity, threshold, farmerId: farmer.farmerId },
        generatedAt: new Date(),
        expiresAt: expireIn(72),
      });
    }

    // Rule E-2: Inactive farmer (not using the platform)
    if (farmer.lastActivityDays > 14) {
      results.push({
        farmerId: farmer.farmerId,
        category: "performance",
        severity: "medium",
        title: `⏰ Inactive Farmer Alert — ${farmer.farmerName}`,
        message: `${farmer.farmerName} has not logged any activity for ${farmer.lastActivityDays} days. Data-driven decisions require regular sensor submissions.`,
        recommendation: "Contact farmer via SMS or extension officer visit. Verify sensor connectivity and provide refresher training on platform usage.",
        actionRequired: false,
        confidence: 85,
        details: { lastActivityDays: farmer.lastActivityDays },
        generatedAt: new Date(),
        expiresAt: expireIn(48),
      });
    }

    // Rule E-3: Insufficient irrigation
    if (farmer.irrigationFrequency < 2 && farmer.cropCount > 0) {
      results.push({
        farmerId: farmer.farmerId,
        category: "performance",
        severity: "medium",
        title: `💧 Insufficient Irrigation — ${farmer.farmerName}`,
        message: `${farmer.farmerName} is irrigating only ${farmer.irrigationFrequency} time(s) per week, which may be insufficient for active crops.`,
        recommendation: "Recommend adopting a structured irrigation schedule (3–4 times/week during dry season). Link farmer to irrigation recommendation module.",
        actionRequired: false,
        confidence: 72,
        details: { irrigationFrequency: farmer.irrigationFrequency, cropCount: farmer.cropCount },
        generatedAt: new Date(),
        expiresAt: expireIn(48),
      });
    }
  }

  return results;
}

// ─── AI Engine Class (Facade) ─────────────────────────────────────────────────

export class AIEngineService {
  /**
   * Run all AI modules for a given farmer using their latest live data.
   * Returns a list of recommendations sorted by severity.
   */
  async analyzeFarm(farmerId: string): Promise<AIRecommendation[]> {
    try {
      const snap = await this.buildSensorSnapshot(farmerId);
      if (!snap) {
        return [this.noDataRecommendation(farmerId)];
      }

      const snapWithId = { ...snap, farmerId };

      const rawResults = [
        analyzeIrrigation(snapWithId as any),
        analyzeWeather(snapWithId as any),
        analyzePestRisk(snapWithId as any),
        analyzeCropHealth(snapWithId as any),
      ].filter((r): r is AIRecommendation => r !== null);

      // Sort: critical → high → medium → low
      const order: Severity[] = ["critical", "high", "medium", "low"];
      const sorted = rawResults.sort(
        (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity)
      );

      // Persist to database asynchronously (fire and forget)
      this.persistRecommendations(sorted).catch((e) =>
        logger.error("AI: failed to persist recommendations", e)
      );

      return sorted;
    } catch (err) {
      logger.error("AIEngine.analyzeFarm error:", err);
      return [this.noDataRecommendation(farmerId)];
    }
  }

  /**
   * Analyze all farmers in a cooperative and return performance insights.
   */
  async analyzeCooperative(cooperativeId?: string): Promise<{
    summary: {
      totalFarmers: number;
      underperforming: number;
      avgProductivity: number;
      alertCount: number;
    };
    recommendations: AIRecommendation[];
    farmerRankings: { farmerId: string; farmerName: string; productivity: number; rank: number }[];
  }> {
    try {
      const where = cooperativeId
        ? { cooperativeId }
        : undefined;

      const farmers = await prisma.farmerProfile.findMany({
        where,
        include: {
          user: true,
          farmerCrops: { where: { status: "planted" } },
          soilReadings: { orderBy: { readingAt: "desc" }, take: 1 },
          irrigationLogs: {
            where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
          },
        },
        take: 100,
      });

      const performanceData: FarmerPerformanceData[] = farmers.map((f) => {
        const latestSoil = f.soilReadings[0];
        const moisture = latestSoil ? Number(latestSoil.moisturePercent) : 0;
        const dataFreshness = latestSoil
          ? Math.max(0, 100 - hoursAgo(latestSoil.readingAt) * 2)
          : 0;

        // Composite productivity score (0-100)
        const moistureScore = moisture >= 30 && moisture <= 70 ? 100 : Math.max(0, 70 - Math.abs(50 - moisture) * 1.5);
        const activityScore = dataFreshness;
        const cropScore = f.farmerCrops.length > 0 ? 80 : 0;
        const irrigScore = Math.min(100, (f.irrigationLogs.length / 4) * 100);
        const productivity = Math.round((moistureScore * 0.3 + activityScore * 0.3 + cropScore * 0.2 + irrigScore * 0.2));

        const lastActivity = latestSoil
          ? Math.floor(hoursAgo(latestSoil.readingAt) / 24)
          : 999;

        return {
          farmerId: f.userId,
          farmerName: f.fullName,
          productivity,
          irrigationFrequency: Math.round(f.irrigationLogs.length / 1), // per week
          farmSize: Number(f.farmSizeHectares ?? 1),
          lastActivityDays: lastActivity,
          cropCount: f.farmerCrops.length,
        };
      });

      const recommendations = analyzeCooperativePerformance(performanceData);
      const avgProductivity =
        performanceData.length > 0
          ? performanceData.reduce((s, f) => s + f.productivity, 0) / performanceData.length
          : 0;

      const rankings = [...performanceData]
        .sort((a, b) => b.productivity - a.productivity)
        .map((f, i) => ({ farmerId: f.farmerId, farmerName: f.farmerName, productivity: f.productivity, rank: i + 1 }));

      return {
        summary: {
          totalFarmers: farmers.length,
          underperforming: recommendations.filter((r) => r.severity === "high").length,
          avgProductivity: Math.round(avgProductivity),
          alertCount: recommendations.length,
        },
        recommendations,
        farmerRankings: rankings,
      };
    } catch (err) {
      logger.error("AIEngine.analyzeCooperative error:", err);
      return {
        summary: { totalFarmers: 0, underperforming: 0, avgProductivity: 0, alertCount: 0 },
        recommendations: [],
        farmerRankings: [],
      };
    }
  }

  /**
   * Analyze from user-submitted IoT sensor payload (no database lookup needed).
   */
  analyzePayload(farmerId: string, payload: SensorSnapshot): AIRecommendation[] {
    const snapWithId = { ...payload, farmerId };
    const results = [
      analyzeIrrigation(snapWithId as any),
      analyzeWeather(snapWithId as any),
      analyzePestRisk(snapWithId as any),
      analyzeCropHealth(snapWithId as any),
    ].filter((r): r is AIRecommendation => r !== null);

    const order: Severity[] = ["critical", "high", "medium", "low"];
    return results.sort((a, b) => order.indexOf(a.severity) - order.indexOf(b.severity));
  }

  /**
   * Build a SensorSnapshot from the latest database records for a farmer.
   */
  private async buildSensorSnapshot(farmerId: string): Promise<SensorSnapshot | null> {
    const profile = await prisma.farmerProfile.findUnique({
      where: { userId: farmerId },
      include: {
        soilReadings: { orderBy: { readingAt: "desc" }, take: 1 },
        farmerCrops: { where: { status: "planted" }, include: { crop: true }, take: 1 },
      },
    });

    if (!profile) return null;

    const soil = profile.soilReadings[0];
    const crop = profile.farmerCrops[0]?.crop;

    // Attempt to get latest weather data
    let temperature = 22;
    let humidity = 60;
    let rainfallProbability = 30;
    let rainfall3DayMm = 5;

    try {
      const weather = await prisma.weatherReading.findFirst({
        where: { farmerId },
        orderBy: { readingAt: "desc" },
      });
      if (weather) {
        temperature = Number(weather.temperatureCelsius ?? 22);
        humidity = Number(weather.humidityPercent ?? 60);
        rainfallProbability = 30; // Not available in WeatherReading model
        rainfall3DayMm = Number(weather.rainfallMm ?? 5) * 3;
      }
    } catch {
      // WeatherData table may not have all fields, use defaults
    }

    return {
      soilMoisture: soil ? Number(soil.moisturePercent) : 50,
      temperature,
      humidity,
      rainfallProbability,
      rainfall3DayMm,
      cropType: crop?.nameEn ?? "Unknown",
      farmSize: Number(profile.farmSizeHectares ?? 1),
      soilPh: soil ? Number(soil.phLevel ?? 6.5) : undefined,
      soilNitrogen: soil ? Number(soil.nitrogenPpm ?? 0) : undefined,
    };
  }

  /**
   * Save recommendations to the Recommendation table.
   */
  private async persistRecommendations(recs: AIRecommendation[]): Promise<void> {
    for (const rec of recs) {
      try {
        await prisma.recommendation.create({
          data: {
            farmerId: rec.farmerId,
            type: rec.category,
            title: rec.title,
            message: rec.message,
            recommendation: rec.recommendation,
            confidence: rec.confidence >= 80 ? "high" : rec.confidence >= 50 ? "medium" : "low",
            priority: severityToPriority(rec.severity),
            actionRequired: rec.actionRequired,
            details: rec.details as any,
            expiresAt: rec.expiresAt,
          },
        });
      } catch {
        // Skip duplicate or schema mismatch errors silently
      }
    }
  }

  private noDataRecommendation(farmerId: string): AIRecommendation {
    return {
      farmerId,
      category: "crop_health",
      severity: "low",
      title: "📊 Insufficient Sensor Data",
      message: "No sensor readings are available for analysis. The AI engine requires recent soil and weather data.",
      recommendation: "Ensure your IoT sensors are connected and submitting data. You can also manually submit readings via the dashboard.",
      actionRequired: false,
      confidence: 0,
      details: {},
      generatedAt: new Date(),
    };
  }
}

function severityToPriority(s: Severity): number {
  return { critical: 5, high: 4, medium: 3, low: 1 }[s] ?? 2;
}

export const aiEngine = new AIEngineService();
