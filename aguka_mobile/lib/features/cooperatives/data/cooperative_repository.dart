import 'package:dio/dio.dart';
import 'models/cooperative_models.dart';

class CooperativeRepository {
  final Dio _dio;

  CooperativeRepository(this._dio);

  Future<Cooperative> getMyCooperative() async {
    try {
      final response = await _dio.get('/cooperatives/my');
      return Cooperative.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }

  Future<List<CooperativeMember>> getMembers(String cooperativeId) async {
    try {
      final response = await _dio.get('/cooperatives/$cooperativeId/members');
      return (response.data['data'] as List)
          .map((m) => CooperativeMember.fromJson(m))
          .toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<void> addMember(String cooperativeId, String phone, String fullName) async {
    try {
      await _dio.post('/cooperatives/$cooperativeId/members', data: {
        'phone': phone,
        'fullName': fullName,
      });
    } catch (e) {
      rethrow;
    }
  }
}
