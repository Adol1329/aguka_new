import 'package:equatable/equatable.dart';

class ReportAnalyticsEntity extends Equatable {
  final ReportOverviewEntity overview;
  final ReportTrendsEntity trends;
  final List<String> recommendations;

  const ReportAnalyticsEntity({
    required this.overview,
    required this.trends,
    required this.recommendations,
  });

  @override
  List<Object?> get props => [overview, trends, recommendations];
}

class ReportOverviewEntity extends Equatable {
  final int score;
  final int moistureStability;
  final int irrigationCompliance;
  final double avgMoisture;

  const ReportOverviewEntity({
    required this.score,
    required this.moistureStability,
    required this.irrigationCompliance,
    required this.avgMoisture,
  });

  @override
  List<Object?> get props => [score, moistureStability, irrigationCompliance, avgMoisture];
}

class ReportTrendsEntity extends Equatable {
  final List<TrendPointEntity> soilMoisture;

  const ReportTrendsEntity({required this.soilMoisture});

  @override
  List<Object?> get props => [soilMoisture];
}

class TrendPointEntity extends Equatable {
  final String label;
  final double value;

  const TrendPointEntity({required this.label, required this.value});

  @override
  List<Object?> get props => [label, value];
}
