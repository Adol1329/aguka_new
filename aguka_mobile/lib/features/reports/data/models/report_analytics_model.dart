import 'package:aguka_mobile/features/reports/domain/entities/report_entity.dart';

class ReportAnalyticsModel extends ReportAnalyticsEntity {
  const ReportAnalyticsModel({
    required super.overview,
    required super.trends,
    required super.recommendations,
  });

  factory ReportAnalyticsModel.fromJson(Map<String, dynamic> json) {
    return ReportAnalyticsModel(
      overview: ReportOverviewModel.fromJson(json['overview'] ?? {}),
      trends: ReportTrendsModel.fromJson(json['trends'] ?? {}),
      recommendations: List<String>.from(json['recommendations'] ?? []),
    );
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
