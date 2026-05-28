import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';

class TelemetryModel extends TelemetryEntity {
  const TelemetryModel({
    required super.soilMoisture,
    required super.temperature,
    required super.ph,
    required super.npk,
    required super.weather,
    required super.timestamp,
  });

  factory TelemetryModel.fromJson(Map<String, dynamic> json) {
    final npkData = json['npk'] ?? {};
    final weatherData = json['weather'] ?? {};
    
    return TelemetryModel(
      soilMoisture: (json['soilMoisture'] ?? 0.0).toDouble(),
      temperature: (json['temperature'] ?? 0.0).toDouble(),
      ph: (json['ph'] ?? 0.0).toDouble(),
      npk: NPKEntity(
        n: (npkData['n'] ?? 0.0).toDouble(),
        p: (npkData['p'] ?? 0.0).toDouble(),
        k: (npkData['k'] ?? 0.0).toDouble(),
      ),
      weather: WeatherEntity(
        tempC: (weatherData['tempC'] ?? 0.0).toDouble(),
        humidity: (weatherData['humidity'] ?? 0.0).toDouble(),
        rainfall: (weatherData['rainfall'] ?? 0.0).toDouble(),
        condition: weatherData['condition'] ?? 'Unknown',
      ),
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'soilMoisture': soilMoisture,
      'temperature': temperature,
      'ph': ph,
      'npk': {
        'n': npk.n,
        'p': npk.p,
        'k': npk.k,
      },
      'weather': {
        'tempC': weather.tempC,
        'humidity': weather.humidity,
        'rainfall': weather.rainfall,
        'condition': weather.condition,
      },
      'timestamp': timestamp.toIso8601String(),
    };
  }
}
