import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/risks/domain/entities/risk_entity.dart';

abstract class RiskRemoteDataSource {
  Future<List<RiskEntity>> getActiveRisks();
}

class RiskRemoteDataSourceImpl implements RiskRemoteDataSource {
  final Dio client;

  RiskRemoteDataSourceImpl(this.client);

  @override
  Future<List<RiskEntity>> getActiveRisks() async {
    try {
      final response = await client.get('/officer/risks');

      if (response.statusCode == 200) {
        final body = response.data;
        final List<dynamic> data = body['data'] ?? [];
        return data.map((json) => RiskEntity(
          id: json['id'] ?? '',
          label: json['title'] ?? 'Unknown',
          severity: json['severity'] ?? 'WARNING',
          location: json['farmer']?['farmName'] ?? json['farmer']?['user']?['fullName'],
          description: json['message'],
          detectedAt: DateTime.tryParse(json['createdAt'] ?? ''),
        )).toList();
      } else {
        throw ServerException('Failed to load risks');
      }
    } on DioException {
      throw ServerException('Failed to load risks');
    }
  }
}
