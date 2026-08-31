import 'package:aguka_mobile/features/reports/domain/entities/report_entity.dart';

class ReportAnalyticsModel extends ReportAnalyticsEntity {
  const ReportAnalyticsModel({
    required super.overview,
    required super.trends,
    required super.recommendations,
    super.executiveSummary,
  });

  factory ReportAnalyticsModel.fromJson(Map<String, dynamic> json) {
    return ReportAnalyticsModel(
      overview: ReportOverviewModel.fromJson(json['overview'] ?? {}),
      trends: ReportTrendsModel.fromJson(json['trends'] ?? {}),
      recommendations: List<String>.from(json['recommendations'] ?? []),
      executiveSummary: json['executiveSummary']?.toString() ?? '',
    );
  }

  /// Maps from the reports-v2 ReportDefinition JSON structure.
  factory ReportAnalyticsModel.fromV2Json(Map<String, dynamic> json) {
    final kpis = (json['kpis'] as List?) ?? [];
    num kpi(String id) {
      final match = kpis.firstWhere(
        (k) => k['id'] == id,
        orElse: () => {'value': 0},
      );
      final v = match['value'];
      return v is num ? v : num.tryParse(v.toString()) ?? 0;
    }

    final charts = (json['charts'] as List?) ?? [];
    final moistureChart = charts.firstWhere(
      (c) => (c['heading'] as String).toLowerCase().contains('moisture'),
      orElse: () => {'data': []},
    );
    final soilMoistureData =
        (moistureChart['data'] as List?) ?? [];

    final recommendations = (json['recommendations'] as List?) ?? [];
    final recStrings = recommendations
        .map<String>((r) =>
            r['title']?.toString() ?? r['action']?.toString() ?? '')
        .where((s) => s.isNotEmpty)
        .toList();

    final insights = (json['insights'] as List?) ?? [];
    final allRecs = [
      ...recStrings,
      ...insights.map((i) => i.toString()),
    ].toSet().toList();

    final score = kpi('score').toInt();
    final avgMoisture = kpi('moisture').toDouble();
    final compliance = kpi('compliance').toInt();

    final moistureValues = soilMoistureData
        .map<double>((p) => (p['value'] as num?)?.toDouble() ?? 0)
        .toList();
    final moistureStability = _computeStability(moistureValues);

    return ReportAnalyticsModel(
      overview: ReportOverviewModel(
        score: score,
        moistureStability: moistureStability,
        irrigationCompliance: compliance,
        avgMoisture: avgMoisture,
      ),
      trends: ReportTrendsModel(
        soilMoisture: soilMoistureData
            .map((p) => TrendPointModel(
                  label: p['label']?.toString() ?? '',
                  value: (p['value'] as num?)?.toDouble() ?? 0,
                ))
            .toList(),
      ),
      recommendations: allRecs.take(5).toList(),
      executiveSummary: json['executiveSummary']?.toString() ?? '',
    );
  }

  static int _computeStability(List<double> values) {
    if (values.isEmpty) return 90;
    final avg = values.reduce((a, b) => a + b) / values.length;
    if (avg == 0) return 90;
    final variance = values.map((v) => (v - avg) * (v - avg)).reduce((a, b) => a + b) / values.length;
    final cv = (variance > 0 ? variance : 0).toDouble();
    final stability = (100 - (cv.clamp(0, 100))).toInt();
    return stability.clamp(0, 100);
  }

  /// Mock data for development when the endpoint is unavailable
  static ReportAnalyticsModel mock() {
    return ReportAnalyticsModel(
      overview: const ReportOverviewModel(
        score: 82,
        moistureStability: 90,
        irrigationCompliance: 75,
        avgMoisture: 64.5,
      ),
      trends: ReportTrendsModel(soilMoisture: [
        const TrendPointModel(label: 'Mon', value: 60),
        const TrendPointModel(label: 'Tue', value: 65),
        const TrendPointModel(label: 'Wed', value: 70),
        const TrendPointModel(label: 'Thu', value: 62),
        const TrendPointModel(label: 'Fri', value: 68),
        const TrendPointModel(label: 'Sat', value: 72),
        const TrendPointModel(label: 'Sun', value: 64),
      ]),
      recommendations: [
        'Increase irrigation on Thursday by 10%.',
        'Soil pH is optimal. No changes needed.',
        'Consider adding potassium supplement this season.',
      ],
      executiveSummary:
          'Your farm is performing well this season with balanced soil moisture and good irrigation compliance.',
    );
  }
}

class ReportOverviewModel extends ReportOverviewEntity {
  const ReportOverviewModel({
    required super.score,
    required super.moistureStability,
    required super.irrigationCompliance,
    required super.avgMoisture,
  });

  factory ReportOverviewModel.fromJson(Map<String, dynamic> json) {
    return ReportOverviewModel(
      score: (json['score'] ?? 0) as int,
      moistureStability: (json['moistureStability'] ?? 0) as int,
      irrigationCompliance: (json['irrigationCompliance'] ?? 0) as int,
      avgMoisture: (json['avgMoisture'] ?? 0.0).toDouble(),
    );
  }
}

class ReportTrendsModel extends ReportTrendsEntity {
  const ReportTrendsModel({required super.soilMoisture});

  factory ReportTrendsModel.fromJson(Map<String, dynamic> json) {
    return ReportTrendsModel(
      soilMoisture: ((json['soilMoisture'] ?? []) as List)
          .map((i) => TrendPointModel.fromJson(i))
          .toList(),
    );
  }
}

class TrendPointModel extends TrendPointEntity {
  const TrendPointModel({required super.label, required super.value});

  factory TrendPointModel.fromJson(Map<String, dynamic> json) {
    return TrendPointModel(
      label: json['label'] ?? '',
      value: (json['value'] ?? 0.0).toDouble(),
    );
  }
}
