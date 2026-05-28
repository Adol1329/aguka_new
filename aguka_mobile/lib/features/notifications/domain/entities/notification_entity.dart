import 'package:equatable/equatable.dart';

class NotificationEntity extends Equatable {
  final String id;
  final String title;
  final String message;
  final String type;
  final String priority;
  final DateTime createdAt;
  final DateTime? readAt;

  const NotificationEntity({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.priority,
    required this.createdAt,
    this.readAt,
  });

  bool get isRead => readAt != null;

  NotificationEntity copyWith({DateTime? readAt}) {
    return NotificationEntity(
      id: id,
      title: title,
      message: message,
      type: type,
      priority: priority,
      createdAt: createdAt,
      readAt: readAt ?? this.readAt,
    );
  }

  @override
  List<Object?> get props => [id, title, message, type, priority, createdAt, readAt];
}
