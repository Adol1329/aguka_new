import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/cooperatives/data/models/cooperative_model.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class CooperativeRemoteDataSource {
  Future<CooperativeModel> getMyCooperative();
  Future<List<CooperativeMemberModel>> getMembers(String cooperativeId);
  Future<void> addMember(String cooperativeId, String phone, String fullName);
}

class CooperativeRemoteDataSourceImpl implements CooperativeRemoteDataSource {
  final DioClient dioClient;

  CooperativeRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<CooperativeModel> getMyCooperative() async {
    try {
      final response = await dioClient.dio.get('/cooperatives/my');
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return CooperativeModel.fromJson(data);
      } else {
        throw ServerException('Failed to fetch cooperative');
      }
    } catch (_) {
      return CooperativeModel.mock();
    }
  }

  @override
  Future<List<CooperativeMemberModel>> getMembers(String cooperativeId) async {
    try {
      final response = await dioClient.dio.get('/cooperatives/$cooperativeId/members');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((m) => CooperativeMemberModel.fromJson(m)).toList();
      } else {
        throw ServerException('Failed to fetch members');
      }
    } catch (_) {
      return CooperativeMemberModel.mockList();
    }
  }

  @override
  Future<void> addMember(String cooperativeId, String phone, String fullName) async {
    try {
      final response = await dioClient.dio.post(
        '/cooperatives/$cooperativeId/members',
        data: {'phone': phone, 'fullName': fullName},
      );
      if (response.statusCode != 200 && response.statusCode != 201) {
        throw ServerException('Failed to add member');
      }
    } catch (e) {
      throw ServerException(e.toString());
    }
  }
}
