import 'package:equatable/equatable.dart';

class WeatherReadingModel extends Equatable {
  final String id;
  final String? farmerId;
  final String? weatherStationId;
  final double? temperatureCelsius;
  final double? humidityPercent;
  final double? rainfallMm;
  final double? windSpeedKmh;
  final String? windDirection;
  final double? pressureHpa;
  final double? uvIndex;
  final Map<String, dynamic>? forecast24hr;
  final Map<String, dynamic>? forecast7day;
  final DateTime readingAt;

  const WeatherReadingModel({
    required this.id,
    this.farmerId,
    this.weatherStationId,
    this.temperatureCelsius,
    this.humidityPercent,
    this.rainfallMm,
    this.windSpeedKmh,
    this.windDirection,
    this.pressureHpa,
    this.uvIndex,
    this.forecast24hr,
    this.forecast7day,
    required this.readingAt,
  });

  factory WeatherReadingModel.fromJson(Map<String, dynamic> json) {
    return WeatherReadingModel(
      id: json['id'] ?? '',
      farmerId: json['farmer_id'] ?? json['farmerId'],
      weatherStationId: json['weather_station_id'] ?? json['weatherStationId'],
      temperatureCelsius: (json['temperature_celsius'] ?? json['temperatureCelsius'] ?? json['temperature'])?.toDouble(),
      humidityPercent: (json['humidity_percent'] ?? json['humidityPercent'] ?? json['humidity'])?.toDouble(),
      rainfallMm: (json['rainfall_mm'] ?? json['rainfallMm'] ?? json['rainfall'])?.toDouble(),
      windSpeedKmh: (json['wind_speed_kmh'] ?? json['windSpeedKmh'])?.toDouble(),
      windDirection: json['wind_direction'] ?? json['windDirection'],
      pressureHpa: (json['pressure_hpa'] ?? json['pressureHpa'])?.toDouble(),
      uvIndex: (json['uv_index'] ?? json['uvIndex'])?.toDouble(),
      forecast24hr: json['forecast_24hr'] ?? json['forecast24hr'],
      forecast7day: json['forecast_7day'] ?? json['forecast7day'],
      readingAt: json['reading_at'] != null
          ? DateTime.parse(json['reading_at'])
          : (json['readingAt'] != null
              ? DateTime.parse(json['readingAt'])
              : DateTime.now()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'farmer_id': farmerId,
        'weather_station_id': weatherStationId,
        'temperature_celsius': temperatureCelsius,
        'humidity_percent': humidityPercent,
        'rainfall_mm': rainfallMm,
        'wind_speed_kmh': windSpeedKmh,
        'wind_direction': windDirection,
        'pressure_hpa': pressureHpa,
        'uv_index': uvIndex,
        'forecast_24hr': forecast24hr,
        'forecast_7day': forecast7day,
        'reading_at': readingAt.toIso8601String(),
      };

  String get weatherCondition {
    if (rainfallMm != null && rainfallMm! > 5) return 'Rainy';
    if (humidityPercent != null && humidityPercent! > 80) return 'Cloudy';
    if (temperatureCelsius != null && temperatureCelsius! > 30) return 'Hot & Sunny';
    return 'Mostly Sunny';
  }

  @override
  List<Object?> get props => [id, temperatureCelsius, readingAt];
}
