import 'dart:convert';
import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/irrigation/data/models/irrigation_status_model.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class IrrigationRemoteDataSource {
  Future<IrrigationStatusModel> getStatus(String farmId);
  Future<IrrigationStatusModel> controlPump(String farmId, bool isActive);
}

class IrrigationRemoteDataSourceImpl implements IrrigationRemoteDataSource {
  final DioClient dioClient;

  IrrigationRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<IrrigationStatusModel> getStatus(String farmId) async {
    try {
      final response = await dioClient.dio.get('/irrigation/status');
      if (response.statusCode == 200) {
        return IrrigationStatusModel.fromJson(response.data['data'] ?? response.data);
      } else {
        throw ServerException('Failed to fetch irrigation status');
      }
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch irrigation status: $e');
    }
  }

  @override
  Future<IrrigationStatusModel> controlPump(String farmId, bool isActive) async {
    try {
      final response = await dioClient.dio.post(
        '/irrigation/control',
        data: jsonEncode({'farmId': farmId, 'action': isActive ? 'start' : 'stop'}),
      );

      if (response.statusCode == 200) {
        // Return updated status
        return IrrigationStatusModel.fromJson(response.data['data'] ?? response.data);
      } else {
        throw ServerException('Failed to control pump');
      }
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to control pump: $e');
    }
  }
}
