class ReportAnalytics {
  final ReportOverview overview;
  final ReportTrends trends;
  final List<String> recommendations;

  ReportAnalytics({
    required this.overview,
    required this.trends,
    required this.recommendations,
  });

  factory ReportAnalytics.fromJson(Map<String, dynamic> json) {
    return ReportAnalytics(
      overview: ReportOverview.fromJson(json['overview']),
      trends: ReportTrends.fromJson(json['trends']),
      recommendations: List<String>.from(json['recommendations']),
    );
  }
}

class ReportOverview {
  final int score;
  final int moistureStability;
  final int irrigationCompliance;
  final double avgMoisture;

  ReportOverview({
    required this.score,
    required this.moistureStability,
    required this.irrigationCompliance,
    required this.avgMoisture,
  });

  factory ReportOverview.fromJson(Map<String, dynamic> json) {
    return ReportOverview(
      score: json['score'],
      moistureStability: json['moistureStability'],
      irrigationCompliance: json['irrigationCompliance'],
      avgMoisture: json['avgMoisture'].toDouble(),
    );
  }
}

class ReportTrends {
  final List<TrendPoint> soilMoisture;

  ReportTrends({required this.soilMoisture});

  factory ReportTrends.fromJson(Map<String, dynamic> json) {
    return ReportTrends(
      soilMoisture: (json['soilMoisture'] as List)
          .map((i) => TrendPoint.fromJson(i))
          .toList(),
    );
  }
}

class TrendPoint {
  final String label;
  final double value;

  TrendPoint({required this.label, required this.value});

  factory TrendPoint.fromJson(Map<String, dynamic> json) {
    return TrendPoint(
      label: json['label'],
      value: json['value'].toDouble(),
    );
  }
}
