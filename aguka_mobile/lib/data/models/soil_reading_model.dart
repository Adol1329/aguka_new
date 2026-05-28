import 'package:equatable/equatable.dart';

class SoilReadingModel extends Equatable {
  final String id;
  final String? sensorId;
  final String farmerId;
  final double moisturePercent;
  final double? temperatureCelsius;
  final double? soilTemperatureCelsius;
  final double? phLevel;
  final double? nitrogenPpm;
  final double? phosphorusPpm;
  final double? potassiumPpm;
  final int? soilHealthScore;
  final DateTime readingAt;

  const SoilReadingModel({
    required this.id,
    this.sensorId,
    required this.farmerId,
    required this.moisturePercent,
    this.temperatureCelsius,
    this.soilTemperatureCelsius,
    this.phLevel,
    this.nitrogenPpm,
    this.phosphorusPpm,
    this.potassiumPpm,
    this.soilHealthScore,
    required this.readingAt,
  });

  factory SoilReadingModel.fromJson(Map<String, dynamic> json) {
    return SoilReadingModel(
      id: json['id'] ?? '',
      sensorId: json['sensor_id'] ?? json['sensorId'],
      farmerId: json['farmer_id'] ?? json['farmerId'] ?? '',
      moisturePercent: (json['moisture_percent'] ?? json['moisturePercent'] ?? 0).toDouble(),
      temperatureCelsius: (json['temperature_celsius'] ?? json['temperatureCelsius'])?.toDouble(),
      soilTemperatureCelsius: (json['soil_temperature_celsius'] ?? json['soilTemperatureCelsius'])?.toDouble(),
      phLevel: (json['ph_level'] ?? json['phLevel'])?.toDouble(),
      nitrogenPpm: (json['nitrogen_ppm'] ?? json['nitrogenPpm'])?.toDouble(),
      phosphorusPpm: (json['phosphorus_ppm'] ?? json['phosphorusPpm'])?.toDouble(),
      potassiumPpm: (json['potassium_ppm'] ?? json['potassiumPpm'])?.toDouble(),
      soilHealthScore: json['soil_health_score'] ?? json['soilHealthScore'],
      readingAt: json['reading_at'] != null
          ? DateTime.parse(json['reading_at'])
          : (json['readingAt'] != null
              ? DateTime.parse(json['readingAt'])
              : DateTime.now()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'sensor_id': sensorId,
        'farmer_id': farmerId,
        'moisture_percent': moisturePercent,
        'temperature_celsius': temperatureCelsius,
        'soil_temperature_celsius': soilTemperatureCelsius,
        'ph_level': phLevel,
        'nitrogen_ppm': nitrogenPpm,
        'phosphorus_ppm': phosphorusPpm,
        'potassium_ppm': potassiumPpm,
        'soil_health_score': soilHealthScore,
        'reading_at': readingAt.toIso8601String(),
      };

  /// Convert to local SQLite row format
  Map<String, dynamic> toLocalRow() => {
        'remote_id': id,
        'farm_id': farmerId,
        'moisture_percent': moisturePercent,
        'temp_celsius': soilTemperatureCelsius ?? temperatureCelsius ?? 0.0,
        'nitrogen': nitrogenPpm ?? 0.0,
        'phosphorus': phosphorusPpm ?? 0.0,
        'potassium': potassiumPpm ?? 0.0,
        'reading_at': readingAt.toIso8601String(),
        'is_synced': 1,
      };

  /// Create from local SQLite row
  factory SoilReadingModel.fromLocalRow(Map<String, dynamic> row) {
    return SoilReadingModel(
      id: row['remote_id'] ?? row['id'].toString(),
      farmerId: row['farm_id'] ?? '',
      moisturePercent: (row['moisture_percent'] ?? 0).toDouble(),
      soilTemperatureCelsius: (row['temp_celsius'] ?? 0).toDouble(),
      nitrogenPpm: (row['nitrogen'] ?? 0).toDouble(),
      phosphorusPpm: (row['phosphorus'] ?? 0).toDouble(),
      potassiumPpm: (row['potassium'] ?? 0).toDouble(),
      readingAt: row['reading_at'] != null
          ? DateTime.parse(row['reading_at'])
          : DateTime.now(),
    );
  }

  @override
  List<Object?> get props => [id, farmerId, moisturePercent, readingAt];
}
