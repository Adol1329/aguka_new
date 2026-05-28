import 'package:aguka_mobile/features/dashboard/domain/entities/dashboard_summary.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';

class DashboardSummaryModel extends DashboardSummary {
  const DashboardSummaryModel({
    required super.telemetry,
    required super.source,
    required super.isCritical,
  });

  factory DashboardSummaryModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'];
    final telemetry = TelemetryEntity(
      soilMoisture: (data['soilMoisture'] ?? 0.0).toDouble(),
      temperature: (data['temperature'] ?? 0.0).toDouble(),
      ph: (data['ph'] ?? 0.0).toDouble(),
      npk: NPKEntity(
        n: (data['npk']?['n'] ?? 0.0).toDouble(),
        p: (data['npk']?['p'] ?? 0.0).toDouble(),
        k: (data['npk']?['k'] ?? 0.0).toDouble(),
      ),
      weather: WeatherEntity(
        tempC: (data['weather']?['tempC'] ?? 0.0).toDouble(),
        humidity: (data['weather']?['humidity'] ?? 0.0).toDouble(),
        rainfall: (data['weather']?['rainfall'] ?? 0.0).toDouble(),
        condition: data['weather']?['condition'] ?? 'Unknown',
      ),
      timestamp: DateTime.parse(data['timestamp'] ?? DateTime.now().toIso8601String()),
    );

    return DashboardSummaryModel(
      telemetry: telemetry,
      source: json['source'] ?? 'api',
      isCritical: telemetry.soilMoisture < 20.0,
    );
  }
}
