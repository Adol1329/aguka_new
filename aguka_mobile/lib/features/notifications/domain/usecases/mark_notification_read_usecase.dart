import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../repositories/notification_repository.dart';

class MarkNotificationReadUseCase implements UseCase<void, String> {
  final NotificationRepository repository;

  MarkNotificationReadUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call(String notificationId) async {
    return await repository.markAsRead(notificationId);
  }
}
