import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/cooperatives/data/models/cooperative_model.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class CooperativeRemoteDataSource {
  Future<CooperativeModel> getMyCooperative();
  Future<List<CooperativeMemberModel>> getMembers(String cooperativeId);
  Future<void> addMember(String cooperativeId, String phone, String fullName);
  Future<List<JoinRequestModel>> getJoinRequests(String cooperativeId);
  Future<void> approveJoinRequest(String cooperativeId, String requestId);
  Future<void> rejectJoinRequest(String cooperativeId, String requestId);
  Future<List<CooperativeActivityModel>> getActivities(String cooperativeId);
  Future<void> createActivity(String cooperativeId, Map<String, dynamic> data);
  Future<List<CooperativeResourceModel>> getResources(String cooperativeId);
  Future<void> addResource(String cooperativeId, Map<String, dynamic> data);
  Future<List<CooperativeListItemModel>> getCooperativeList();
  Future<void> requestMembership(String cooperativeId);
}

class CooperativeRemoteDataSourceImpl implements CooperativeRemoteDataSource {
  final DioClient dioClient;

  CooperativeRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<CooperativeModel> getMyCooperative() async {
    try {
      final response = await dioClient.dio.get('/cooperatives/me');
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return CooperativeModel.fromJson(data);
      } else {
        throw ServerException('Failed to fetch cooperative');
      }
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch cooperative: $e');
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
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch members: $e');
    }
  }

  @override
  Future<void> addMember(String cooperativeId, String phone, String fullName) async {
    final response = await dioClient.dio.post(
      '/cooperatives/$cooperativeId/members',
      data: {'phone': phone, 'fullName': fullName},
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ServerException('Failed to add member');
    }
  }

  @override
  Future<List<JoinRequestModel>> getJoinRequests(String cooperativeId) async {
    try {
      final response = await dioClient.dio.get('/cooperatives/$cooperativeId/join-requests');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((r) => JoinRequestModel.fromJson(r)).toList();
      }
      throw ServerException('Failed to fetch join requests');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch join requests: $e');
    }
  }

  @override
  Future<void> approveJoinRequest(String cooperativeId, String requestId) async {
    final response = await dioClient.dio
        .patch('/cooperatives/$cooperativeId/join-requests/$requestId/approve');
    if (response.statusCode != 200) {
      throw ServerException('Failed to approve request');
    }
  }

  @override
  Future<void> rejectJoinRequest(String cooperativeId, String requestId) async {
    final response = await dioClient.dio
        .patch('/cooperatives/$cooperativeId/join-requests/$requestId/reject');
    if (response.statusCode != 200) {
      throw ServerException('Failed to reject request');
    }
  }

  @override
  Future<List<CooperativeActivityModel>> getActivities(String cooperativeId) async {
    try {
      final response = await dioClient.dio.get('/cooperatives/$cooperativeId/activities');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((a) => CooperativeActivityModel.fromJson(a)).toList();
      }
      throw ServerException('Failed to fetch activities');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch activities: $e');
    }
  }

  @override
  Future<void> createActivity(String cooperativeId, Map<String, dynamic> data) async {
    final response = await dioClient.dio.post(
      '/cooperatives/$cooperativeId/activities',
      data: data,
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ServerException('Failed to schedule event');
    }
  }

  @override
  Future<List<CooperativeResourceModel>> getResources(String cooperativeId) async {
    try {
      final response = await dioClient.dio.get('/cooperatives/$cooperativeId/resources');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((r) => CooperativeResourceModel.fromJson(r)).toList();
      }
      throw ServerException('Failed to fetch resources');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch resources: $e');
    }
  }

  @override
  Future<void> addResource(String cooperativeId, Map<String, dynamic> data) async {
    final response = await dioClient.dio.post(
      '/cooperatives/$cooperativeId/resources',
      data: data,
    );
    if (response.statusCode != 200 && response.statusCode != 201) {
      throw ServerException('Failed to add resource');
    }
  }

  @override
  Future<List<CooperativeListItemModel>> getCooperativeList() async {
    try {
      final response = await dioClient.dio.get('/cooperatives');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((c) => CooperativeListItemModel.fromJson(c)).toList();
      }
      throw ServerException('Failed to fetch cooperative list');
    } on ServerException {
      rethrow;
    } catch (e) {
      throw ServerException('Failed to fetch cooperative list: $e');
    }
  }

  @override
  Future<void> requestMembership(String cooperativeId) async {
    final response = await dioClient.dio.post('/cooperatives/$cooperativeId/join-request');
    if (response.statusCode != 200 && response.statusCode != 201) {
      final msg = response.data?['error']?['message'] ?? 'Failed to send request';
      throw ServerException(msg);
    }
  }
}
