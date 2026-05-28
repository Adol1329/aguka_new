import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/features/notifications/data/models/notification_model.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:dio/dio.dart';

abstract class NotificationRemoteDataSource {
  Future<List<NotificationModel>> getNotifications();
  Future<void> markAsRead(String notificationId);
  Future<void> markAllAsRead();
}

class NotificationRemoteDataSourceImpl implements NotificationRemoteDataSource {
  final DioClient dioClient;

  NotificationRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<NotificationModel>> getNotifications() async {
    try {
      final response = await dioClient.dio.get('/notifications');
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'] ?? response.data;
        return data.map((json) => NotificationModel.fromJson(json)).toList();
      } else {
        throw ServerException();
      }
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load notifications'));
    } catch (e) {
      throw ServerException('Failed to load notifications');
    }
  }

  @override
  Future<void> markAsRead(String notificationId) async {
    try {
      final response = await dioClient.dio.post('/notifications/mark-read', data: {
        'notificationIds': [notificationId],
      });
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException();
      }
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to mark notification as read'));
    } catch (e) {
      throw ServerException('Failed to mark notification as read');
    }
  }

  @override
  Future<void> markAllAsRead() async {
    try {
      final response = await dioClient.dio.post('/notifications/mark-all-read');
      if (response.statusCode != 200 && response.statusCode != 204) {
        throw ServerException();
      }
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to mark notifications as read'));
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
