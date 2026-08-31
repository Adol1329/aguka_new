import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class MarketAlertsRemoteDataSource {
  Future<List<Map<String, dynamic>>> getAlerts();
  Future<Map<String, dynamic>> createAlert({
    required String cropId,
    required double targetPrice,
    required String alertType,
  });
  Future<void> deleteAlert(String id);
}

class MarketAlertsRemoteDataSourceImpl implements MarketAlertsRemoteDataSource {
  final DioClient dioClient;

  MarketAlertsRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<Map<String, dynamic>>> getAlerts() async {
    try {
      final response = await dioClient.dio.get('/market/alerts');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.cast<Map<String, dynamic>>();
      }
      throw ServerException('Failed to fetch price alerts');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch price alerts: $e');
    }
  }

  @override
  Future<Map<String, dynamic>> createAlert({
    required String cropId,
    required double targetPrice,
    required String alertType,
  }) async {
    try {
      final response = await dioClient.dio.post('/market/alerts', data: {
        'cropId': cropId,
        'targetPrice': targetPrice,
        'alertType': alertType,
      });
      if (response.statusCode == 200 || response.statusCode == 201) {
        return (response.data['data'] ?? response.data) as Map<String, dynamic>;
      }
      throw ServerException('Failed to create price alert');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to create price alert: $e');
    }
  }

  @override
  Future<void> deleteAlert(String id) async {
    try {
      final response = await dioClient.dio.delete('/market/alerts/$id');
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException('Failed to delete price alert');
      }
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to delete price alert: $e');
    }
  }
}
