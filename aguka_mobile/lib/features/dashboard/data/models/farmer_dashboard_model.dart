import 'package:aguka_mobile/features/dashboard/domain/entities/farmer_dashboard_data.dart';

class FarmerDashboardModel extends FarmerDashboardData {
  const FarmerDashboardModel({
    super.farmer,
    super.soilLatest,
    super.soilTrend,
    super.weather,
    super.crops,
    super.recentActivities,
  });

  factory FarmerDashboardModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? {};
    final rawFarmer = data['farmer'] as Map<String, dynamic>? ?? {};

    final rawSoil = data['soilLatest'] as Map<String, dynamic>? ?? {};
    final rawWeather = data['weather'] as Map<String, dynamic>? ?? {};

    final List<dynamic> rawTrend = data['soilTrend'] ?? [];
    final List<dynamic> rawCrops = data['crops'] ?? [];
    final List<dynamic> rawActivities = data['recentActivities'] ?? [];

    return FarmerDashboardModel(
      farmer: FarmerInfo(
        fullName: rawFarmer['fullName'] as String? ?? '',
        farmName: rawFarmer['farmName'] as String? ?? '',
        district: rawFarmer['district'] as String? ?? '',
        sector: rawFarmer['sector'] as String? ?? '',
      ),
      soilLatest: SoilData(
        moisture: (rawSoil['moisture'] ?? 0).toDouble(),
        temperature: (rawSoil['temperature'] ?? 0).toDouble(),
        ph: (rawSoil['ph'] ?? 0).toDouble(),
        nitrogen: (rawSoil['nitrogen'] ?? 0).toDouble(),
        phosphorus: (rawSoil['phosphorus'] ?? 0).toDouble(),
        potassium: (rawSoil['potassium'] ?? 0).toDouble(),
        recordedAt: rawSoil['recordedAt'] as String? ?? '',
        hasData: rawSoil['hasData'] as bool? ?? false,
      ),
      soilTrend: rawTrend.map((t) {
        final point = t as Map<String, dynamic>;
        return SoilTrendPoint(
          recordedAt: point['recordedAt'] as String? ?? '',
          moisture: (point['moisture'] ?? 0).toDouble(),
          temperature: (point['temperature'] ?? 0).toDouble(),
          ph: (point['ph'] ?? 0).toDouble(),
        );
      }).toList(),
      weather: WeatherData(
        temperature: (rawWeather['temperature'] ?? 0).toDouble(),
        condition: rawWeather['condition'] as String? ?? '',
        humidity: (rawWeather['humidity'] ?? 0).toDouble(),
        forecast: rawWeather['forecast'] as List<dynamic>? ?? [],
      ),
      crops: rawCrops.map((c) {
        final crop = c as Map<String, dynamic>;
        return CropInfo(
          id: crop['id'] as String? ?? '',
          cropName: crop['cropName'] as String? ?? '',
          cropCategory: crop['cropCategory'] as String? ?? '',
          areaHectares: (crop['areaHectares'] ?? 0).toDouble(),
          plantedDate: crop['plantedDate'] as String? ?? '',
          growingDurationDays: (crop['growingDurationDays'] ?? 0) as int,
          status: crop['status'] as String? ?? '',
          estimatedYieldKg: (crop['estimatedYieldKg'] as num?)?.toDouble(),
          location: crop['location'] as String? ?? '',
        );
      }).toList(),
      recentActivities: rawActivities.map((a) {
        final act = a as Map<String, dynamic>;
        return FarmerActivityItem(
          id: act['id'] as String? ?? '',
          activityType: act['activityType'] as String? ?? '',
          cropName: act['cropName'] as String?,
          notes: act['notes'] as String?,
          activityDate: act['activityDate'] as String? ?? '',
        );
      }).toList(),
    );
  }
}
