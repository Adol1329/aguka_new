import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/activities/data/models/activity_model.dart';
import 'package:aguka_mobile/features/activities/data/models/farmer_crop_option_model.dart';

abstract class ActivityRemoteDataSource {
  Future<List<ActivityModel>> getActivities();
  Future<List<String>> getActivityTypes();
  Future<List<FarmerCropOptionModel>> getFarmerCrops();
  Future<ActivityModel> createActivity({
    required String activityType,
    required String description,
    required DateTime activityDate,
    String? cropId,
    Map<String, dynamic>? inputs,
  });
}

class ActivityRemoteDataSourceImpl implements ActivityRemoteDataSource {
  final DioClient dioClient;

  ActivityRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<ActivityModel>> getActivities() async {
    try {
      final response = await dioClient.dio.get('/farmer/activities');
      final data = response.data['data'] ?? response.data;
      if (data is! List) throw ServerException('Invalid activities response');
      return data
          .map((item) => ActivityModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load activities'));
    }
  }

  @override
  Future<List<String>> getActivityTypes() async {
    try {
      final response = await dioClient.dio.get('/farmer/activity-types');
      final data = response.data['data'] ?? response.data;
      if (data is! List) throw ServerException('Invalid activity types response');
      return data.map((item) => item.toString()).where((item) => item.isNotEmpty).toList();
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load activity types'));
    }
  }

  @override
  Future<List<FarmerCropOptionModel>> getFarmerCrops() async {
    try {
      final response = await dioClient.dio.get('/farmer/crops');
      final data = response.data['data'] ?? response.data;
      if (data is! List) throw ServerException('Invalid crops response');
      return data
          .map((item) => FarmerCropOptionModel.fromJson(item as Map<String, dynamic>))
          .where((crop) => crop.id.isNotEmpty)
          .toList();
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load crops'));
    }
  }

  @override
  Future<ActivityModel> createActivity({
    required String activityType,
    required String description,
    required DateTime activityDate,
    String? cropId,
    Map<String, dynamic>? inputs,
  }) async {
    try {
      final response = await dioClient.dio.post('/farmer/activities', data: {
        'activityType': activityType,
        'notes': description,
        'activityDate': activityDate.toIso8601String(),
        if (cropId != null && cropId.isNotEmpty) 'cropId': cropId,
        if (inputs != null) ...inputs,
      });
      final data = response.data['data'] ?? response.data;
      return ActivityModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to create activity'));
    }
  }

  String _errorMessage(DioException error, String fallback) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final errorValue = data['error'];
      if (errorValue is Map<String, dynamic>) {
        return errorValue['message']?.toString() ?? fallback;
      }
      if (errorValue is String) return errorValue;
      return data['message']?.toString() ?? fallback;
    }
    return error.message ?? fallback;
  }
}
