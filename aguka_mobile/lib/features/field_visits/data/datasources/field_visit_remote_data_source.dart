import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/field_visits/domain/entities/field_visit_entity.dart';

abstract class FieldVisitRemoteDataSource {
  Future<List<FieldVisitEntity>> getFieldVisits();
}

class FieldVisitRemoteDataSourceImpl implements FieldVisitRemoteDataSource {
  final Dio client;

  FieldVisitRemoteDataSourceImpl(this.client);

  @override
  Future<List<FieldVisitEntity>> getFieldVisits() async {
    try {
      final response = await client.get('/officer/field-work');

      if (response.statusCode == 200) {
        final body = response.data;
        final List<dynamic> data = body['data'] ?? [];
        return data.map((json) => FieldVisitEntity(
          id: json['id'] ?? '',
          farmerName: json['farmer']?['fullName'] ?? 'Unknown',
          farmName: json['farmer']?['farmName'],
          scheduledDate: DateTime.tryParse(json['visitDate'] ?? '') ?? DateTime.now(),
          status: json['status'],
          notes: json['notes'],
        )).toList();
      } else {
        throw ServerException('Failed to load field visits');
      }
    } on DioException {
      throw ServerException('Failed to load field visits');
    }
  }
}
