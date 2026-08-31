import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class CropsRemoteDataSource {
  Future<List<Map<String, dynamic>>> getCropCatalog();
  Future<List<Map<String, dynamic>>> getMyCrops();
  Future<Map<String, dynamic>> addCrop({
    required String cropId,
    required DateTime plantedDate,
    DateTime? expectedHarvestDate,
    double? plotSizeHectares,
    String? notes,
  });
}

class CropsRemoteDataSourceImpl implements CropsRemoteDataSource {
  final DioClient dioClient;

  CropsRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<Map<String, dynamic>>> getCropCatalog() async {
    try {
      final response = await dioClient.dio.get('/farmer/crop-types');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.cast<Map<String, dynamic>>();
      }
      throw ServerException('Failed to fetch crop catalog');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch crop catalog: $e');
    }
  }

  @override
  Future<List<Map<String, dynamic>>> getMyCrops() async {
    try {
      final response = await dioClient.dio.get('/farmer/crops');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.cast<Map<String, dynamic>>();
      }
      throw ServerException('Failed to fetch your crops');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch your crops: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> addCrop({
    required String cropId,
    required DateTime plantedDate,
    DateTime? expectedHarvestDate,
    double? plotSizeHectares,
    String? notes,
  }) async {
    try {
      final response = await dioClient.dio.post('/farmer/crops', data: {
        'cropId': cropId,
        'plantedDate': plantedDate.toIso8601String(),
        if (expectedHarvestDate != null)
          'expectedHarvestDate': expectedHarvestDate.toIso8601String(),
        if (plotSizeHectares != null) 'plotSizeHectares': plotSizeHectares,
        if (notes != null && notes.isNotEmpty) 'notes': notes,
      });
      if (response.statusCode == 200 || response.statusCode == 201) {
        return (response.data['data'] ?? response.data) as Map<String, dynamic>;
      }
      throw ServerException('Failed to add crop');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to add crop: $e');
    }
  }
}
