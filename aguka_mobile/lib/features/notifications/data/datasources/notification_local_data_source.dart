import 'package:aguka_mobile/shared/data/local/database_helper.dart';
import 'package:aguka_mobile/features/notifications/data/models/notification_model.dart';

abstract class NotificationLocalDataSource {
  Future<List<NotificationModel>> getCachedNotifications();
  Future<void> cacheNotifications(List<NotificationModel> notifications);
  Future<void> markAsRead(String notificationId);
}

class NotificationLocalDataSourceImpl implements NotificationLocalDataSource {
  final DatabaseHelper databaseHelper;

  NotificationLocalDataSourceImpl({required this.databaseHelper});

  @override
  Future<List<NotificationModel>> getCachedNotifications() async {
    final db = await databaseHelper.database;
    final results = await db.query(
      'notifications',
      orderBy: 'created_at DESC',
    );
    
    return results.map((json) => NotificationModel(
      id: json['remote_id'] as String? ?? json['id'].toString(),
      title: json['title'] as String,
      message: json['message'] as String,
      type: json['type'] as String,
      priority: json['priority'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      readAt: json['read_at'] != null ? DateTime.parse(json['read_at'] as String) : null,
    )).toList();
  }

  @override
  Future<void> cacheNotifications(List<NotificationModel> notifications) async {
    final mapped = notifications.map((n) => {
      'remote_id': n.id,
      'title': n.title,
      'message': n.message,
      'type': n.type,
      'priority': n.priority,
      'created_at': n.createdAt.toIso8601String(),
      'read_at': n.readAt?.toIso8601String(),
    }).toList();
    
    await databaseHelper.insertNotifications(mapped);
  }

  @override
  Future<void> markAsRead(String notificationId) async {
    final db = await databaseHelper.database;
    await db.update(
      'notifications',
      {'read_at': DateTime.now().toIso8601String()},
      where: 'remote_id = ?',
      whereArgs: [notificationId],
    );
  }
}
