export class ReportAnalyticsEngine {
  calculateMoistureStability(readings: any[]): number {
    if (readings.length === 0) return 0;
    const stableCount = readings.filter(
      (r) => r.moisturePercent >= 35 && r.moisturePercent <= 75,
    ).length;
    return Math.round((stableCount / readings.length) * 100);
  }

  calculateIrrigationCompliance(logs: any[], schedules: any[]): number {
    if (schedules.length === 0) {
      return logs.length > 0 ? 100 : 0;
    }
    const expectedSessions = schedules.length * 24;
    if (expectedSessions === 0) return 0;
    const complianceRate = Math.round((logs.length / expectedSessions) * 100);
    return Math.min(100, complianceRate);
  }

  calculateAvgMoisture(readings: any[]): number {
    if (readings.length === 0) return 0;
    return (
      readings.reduce((acc, r) => acc + Number(r.moisturePercent), 0) /
      readings.length
    );
  }

  generateRecommendations(
    score: number,
    moisture: number,
    irrigation: number,
  ): string[] {
    const recs: string[] = [];
    if (moisture < 70) recs.push("Increase sensor-based irrigation frequency.");
    if (irrigation < 80)
      recs.push("Review missed automated irrigation sessions.");
    if (score < 60) recs.push("Consult extension officer.");
    if (recs.length === 0) recs.push("Maintain current practices.");
    return recs;
  }

  getSoilStatusString(moisture: number): string {
    if (moisture > 40) return "Optimal";
    if (moisture > 30) return "Good";
    return "Action Required";
  }

  calculateWeeklyTrends(readings: any[]) {
    const groups: { [key: string]: number[] } = {};
    readings.forEach((r) => {
      const week = new Date(r.readingAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      if (!groups[week]) groups[week] = [];
      groups[week].push(Number(r.moisturePercent));
    });

    return Object.keys(groups)
      .map((key) => ({
        label: key,
        value: groups[key].reduce((a, b) => a + b, 0) / groups[key].length,
      }))
      .reverse();
  }
}

export const reportAnalytics = new ReportAnalyticsEngine();
