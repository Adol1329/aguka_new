import { RecommendationItem, RiskItem, Kpi } from "./types.js";
import { classifyRisk } from "./utils.js";

interface MoistureInput {
  average: number;
  variability: number;
  trend: "rising" | "falling" | "stable";
}

interface IrrigationInput {
  compliance: number;
  totalLiters: number;
  scheduleCount: number;
  skippedCount: number;
}

interface YieldInput {
  estimatedKg: number;
  actualKg: number;
  cropCount: number;
  cropTypes: string[];
}

export function deriveRecommendations(args: {
  moisture: MoistureInput;
  irrigation: IrrigationInput;
  yield: YieldInput;
  alertCount: number;
  criticalAlertCount: number;
}): RecommendationItem[] {
  const recs: RecommendationItem[] = [];

  if (args.moisture.average < 30) {
    recs.push({
      priority: "urgent",
      category: "Soil",
      title: "Increase irrigation to lift soil moisture",
      rationale: `Average soil moisture is ${args.moisture.average.toFixed(1)}%, well below the 40% crop-safe threshold.`,
      action:
        "Schedule supplemental irrigation within 24 hours and verify sensor calibration.",
      confidence: "high",
      evidence: `Variability ${args.moisture.variability.toFixed(1)}% indicates inconsistent application.`,
    });
  } else if (args.moisture.average < 45) {
    recs.push({
      priority: "high",
      category: "Soil",
      title: "Monitor soil moisture closely",
      rationale: `Average soil moisture ${args.moisture.average.toFixed(1)}% is in the caution band.`,
      action:
        "Inspect irrigation schedule and reduce interval to every other day.",
      confidence: "medium",
    });
  }

  if (args.moisture.variability > 18) {
    recs.push({
      priority: "medium",
      category: "Soil",
      title: "Stabilize soil moisture distribution",
      rationale: `Moisture variability of ${args.moisture.variability.toFixed(1)}% suggests uneven irrigation coverage.`,
      action: "Audit drip lines and consider zone-based scheduling.",
      confidence: "high",
    });
  }

  if (args.irrigation.compliance < 70) {
    recs.push({
      priority: "high",
      category: "Irrigation",
      title: "Improve irrigation schedule compliance",
      rationale: `Only ${args.irrigation.compliance.toFixed(0)}% of scheduled irrigation cycles were executed.`,
      action:
        "Review automation triggers and notify the assigned extension officer.",
      confidence: "high",
      evidence: `${args.irrigation.skippedCount} of ${args.irrigation.scheduleCount} cycles skipped.`,
    });
  }

  if (args.criticalAlertCount > 0) {
    recs.push({
      priority: "urgent",
      category: "Risk",
      title: `${args.criticalAlertCount} critical alert(s) unresolved`,
      rationale: "Unresolved critical alerts escalate crop-loss risk.",
      action: "Acknowledge and dispatch field response within 24 hours.",
      confidence: "high",
    });
  } else if (args.alertCount > 3) {
    recs.push({
      priority: "medium",
      category: "Risk",
      title: "Reduce alert backlog",
      rationale: `${args.alertCount} alerts open in the period.`,
      action: "Triage alerts weekly and close out informational ones.",
      confidence: "medium",
    });
  }

  if (args.yield.actualKg > 0 && args.yield.estimatedKg > 0) {
    const ratio = args.yield.actualKg / args.yield.estimatedKg;
    if (ratio < 0.7) {
      recs.push({
        priority: "high",
        category: "Yield",
        title: "Investigate yield shortfall",
        rationale: `Actual yield is ${Math.round(ratio * 100)}% of estimated yield.`,
        action:
          "Review pest, weather, and input-quality factors for the season.",
        confidence: "high",
      });
    } else if (ratio > 1.15) {
      recs.push({
        priority: "low",
        category: "Yield",
        title: "Document above-expected yield",
        rationale: `Actual yield exceeds estimates by ${Math.round((ratio - 1) * 100)}%.`,
        action:
          "Capture successful practices for the cooperative learning exchange.",
        confidence: "medium",
      });
    }
  }

  if (recs.length === 0) {
    recs.push({
      priority: "low",
      category: "Operations",
      title: "Maintain current practices",
      rationale: "All key indicators are within healthy ranges for the period.",
      action: "Continue scheduled monitoring and review next period.",
      confidence: "high",
    });
  }

  return recs.sort(
    (a, b) => priorityWeight(b.priority) - priorityWeight(a.priority),
  );
}

function priorityWeight(p: RecommendationItem["priority"]): number {
  return { urgent: 4, high: 3, medium: 2, low: 1 }[p];
}

export function deriveRisks(input: {
  performanceScore: number;
  complianceScore: number;
  moistureStability: number;
  alertCount: number;
  criticalAlertCount: number;
  yieldRatio: number;
}): RiskItem[] {
  const items: RiskItem[] = [];

  if (input.performanceScore < 50) {
    items.push({
      level: "critical",
      category: "Performance",
      message: `Composite performance score is critically low (${input.performanceScore}/100).`,
      recommendation:
        "Escalate to extension officer for in-person visit within 7 days.",
    });
  } else if (input.performanceScore < 70) {
    items.push({
      level: "high",
      category: "Performance",
      message: `Performance score below healthy threshold (${input.performanceScore}/100).`,
      recommendation:
        "Schedule advisory visit and review soil/irrigation logs.",
    });
  }

  if (input.complianceScore < 60) {
    items.push({
      level: "high",
      category: "Irrigation",
      message: `Irrigation compliance at ${input.complianceScore.toFixed(0)}%.`,
      recommendation: "Audit automated schedule and confirm pump availability.",
    });
  }

  if (input.moistureStability < 50) {
    items.push({
      level: classifyRisk(input.moistureStability),
      category: "Soil",
      message: `Soil moisture stability is low (${input.moistureStability.toFixed(0)}%).`,
      recommendation:
        "Switch to weather-based irrigation and verify sensor health.",
    });
  }

  if (input.criticalAlertCount > 0) {
    items.push({
      level: "critical",
      category: "Alerting",
      message: `${input.criticalAlertCount} unresolved critical alert(s).`,
      affected: input.criticalAlertCount,
      recommendation: "Trigger immediate field response workflow.",
    });
  }

  if (input.yieldRatio > 0 && input.yieldRatio < 0.7) {
    items.push({
      level: "high",
      category: "Yield",
      message: `Yield is ${Math.round(input.yieldRatio * 100)}% of estimate.`,
      recommendation:
        "Review agronomic inputs and weather history for the season.",
    });
  }

  return items;
}

export function buildPerformanceKpis(
  score: number,
  moisture: number,
  irrigation: number,
): Kpi[] {
  return [
    {
      id: "performance",
      label: "Performance Score",
      value: score,
      unit: "/100",
      icon: "🏆",
      hint: "Composite weighted score",
    },
    {
      id: "moisture",
      label: "Avg. Soil Moisture",
      value: moisture.toFixed(1),
      unit: "%",
      icon: "💧",
      hint: "Period average across all zones",
    },
    {
      id: "irrigation",
      label: "Irrigation Compliance",
      value: irrigation.toFixed(0),
      unit: "%",
      icon: "🚿",
      hint: "Executed vs scheduled cycles",
    },
  ];
}
