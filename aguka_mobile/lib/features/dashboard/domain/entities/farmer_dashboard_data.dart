import 'package:equatable/equatable.dart';

class FarmerDashboardData extends Equatable {
  final FarmerInfo farmer;
  final SoilData soilLatest;
  final List<SoilTrendPoint> soilTrend;
  final WeatherData weather;
  final List<CropInfo> crops;
  final List<FarmerActivityItem> recentActivities;

  const FarmerDashboardData({
    this.farmer = const FarmerInfo(),
    this.soilLatest = const SoilData(),
    this.soilTrend = const [],
    this.weather = const WeatherData(),
    this.crops = const [],
    this.recentActivities = const [],
  });

  @override
  List<Object?> get props =>
      [farmer, soilLatest, soilTrend, weather, crops, recentActivities];
}

class FarmerInfo extends Equatable {
  final String fullName;
  final String farmName;
  final String district;
  final String sector;

  const FarmerInfo({
    this.fullName = '',
    this.farmName = '',
    this.district = '',
    this.sector = '',
  });

  @override
  List<Object?> get props => [fullName, farmName, district, sector];
}

class SoilData extends Equatable {
  final double moisture;
  final double temperature;
  final double ph;
  final double nitrogen;
  final double phosphorus;
  final double potassium;
  final String recordedAt;
  final bool hasData;

  const SoilData({
    this.moisture = 0,
    this.temperature = 0,
    this.ph = 0,
    this.nitrogen = 0,
    this.phosphorus = 0,
    this.potassium = 0,
    this.recordedAt = '',
    this.hasData = false,
  });

  @override
  List<Object?> get props =>
      [moisture, temperature, ph, nitrogen, phosphorus, potassium, recordedAt, hasData];
}

class SoilTrendPoint extends Equatable {
  final String recordedAt;
  final double moisture;
  final double temperature;
  final double ph;

  const SoilTrendPoint({
    required this.recordedAt,
    this.moisture = 0,
    this.temperature = 0,
    this.ph = 0,
  });

  @override
  List<Object?> get props => [recordedAt, moisture, temperature, ph];
}

class WeatherData extends Equatable {
  final double temperature;
  final String condition;
  final double humidity;
  final List<dynamic> forecast;

  const WeatherData({
    this.temperature = 0,
    this.condition = '',
    this.humidity = 0,
    this.forecast = const [],
  });

  @override
  List<Object?> get props => [temperature, condition, humidity, forecast];
}

class CropInfo extends Equatable {
  final String id;
  final String cropName;
  final String cropCategory;
  final double areaHectares;
  final String plantedDate;
  final int growingDurationDays;
  final String status;
  final double? estimatedYieldKg;
  final String location;

  const CropInfo({
    required this.id,
    this.cropName = '',
    this.cropCategory = '',
    this.areaHectares = 0,
    this.plantedDate = '',
    this.growingDurationDays = 0,
    this.status = '',
    this.estimatedYieldKg,
    this.location = '',
  });

  @override
  List<Object?> get props =>
      [id, cropName, cropCategory, areaHectares, plantedDate, growingDurationDays, status, estimatedYieldKg, location];
}

class FarmerActivityItem extends Equatable {
  final String id;
  final String activityType;
  final String? cropName;
  final String? notes;
  final String activityDate;

  const FarmerActivityItem({
    required this.id,
    this.activityType = '',
    this.cropName,
    this.notes,
    this.activityDate = '',
  });

  @override
  List<Object?> get props =>
      [id, activityType, cropName, notes, activityDate];
}
