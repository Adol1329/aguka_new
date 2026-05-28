import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/guidance/data/models/guidance_models.dart';

abstract class GuidanceRemoteDataSource {
  Future<List<CropModel>> getCrops();
  Future<CropGuidanceModel> getCropGuidance(String farmerCropId);
  Future<List<LivestockModel>> getLivestock();
  Future<LivestockGuidanceModel> getLivestockGuidance(String livestockId);
}

class GuidanceRemoteDataSourceImpl implements GuidanceRemoteDataSource {
  final DioClient dioClient;

  GuidanceRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<CropModel>> getCrops() async {
    try {
      final response = await dioClient.dio.get('/farmer/crops');
      final data = response.data['data'] ?? response.data;
      if (data is! List) throw ServerException('Invalid crops response');
      return data
          .map((item) => CropModel.fromJson(item as Map<String, dynamic>))
          .where((crop) => crop.id.isNotEmpty)
          .toList();
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load crops'));
    }
  }

  @override
  Future<CropGuidanceModel> getCropGuidance(String farmerCropId) async {
    try {
      final response = await dioClient.dio.get('/farmer/crops/$farmerCropId/guidance');
      final data = response.data['data'] ?? response.data;
      return CropGuidanceModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load crop guidance'));
    }
  }

  @override
  Future<List<LivestockModel>> getLivestock() async {
    try {
      final response = await dioClient.dio.get('/livestock');
      final data = response.data['data'] ?? response.data;
      if (data is! List) throw ServerException('Invalid livestock response');
      return data
          .map((item) => LivestockModel.fromJson(item as Map<String, dynamic>))
          .where((item) => item.id.isNotEmpty)
          .toList();
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load livestock'));
    }
  }

  @override
  Future<LivestockGuidanceModel> getLivestockGuidance(String livestockId) async {
    try {
      final response = await dioClient.dio.get('/livestock/$livestockId/guidance');
      final data = response.data['data'] ?? response.data;
      return LivestockGuidanceModel.fromJson(data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load livestock guidance'));
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
