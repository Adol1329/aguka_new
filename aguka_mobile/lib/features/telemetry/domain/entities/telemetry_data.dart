import 'package:equatable/equatable.dart';

class TelemetryEntity extends Equatable {
  final double soilMoisture;
  final double temperature;
  final double ph;
  final NPKEntity npk;
  final WeatherEntity weather;
  final DateTime timestamp;

  const TelemetryEntity({
    required this.soilMoisture,
    required this.temperature,
    required this.ph,
    required this.npk,
    required this.weather,
    required this.timestamp,
  });

  @override
  List<Object?> get props => [soilMoisture, temperature, ph, npk, weather, timestamp];
}

class NPKEntity extends Equatable {
  final double n;
  final double p;
  final double k;

  const NPKEntity({required this.n, required this.p, required this.k});

  @override
  List<Object?> get props => [n, p, k];
}

class WeatherEntity extends Equatable {
  final double tempC;
  final double humidity;
  final double rainfall;
  final String condition;

  const WeatherEntity({
    required this.tempC,
    required this.humidity,
    required this.rainfall,
    required this.condition,
  });

  @override
  List<Object?> get props => [tempC, humidity, rainfall, condition];
}
