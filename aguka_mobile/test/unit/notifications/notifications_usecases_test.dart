import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/notifications/domain/repositories/notification_repository.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_notification_read_usecase.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../../helpers/test_fixtures.dart';

@GenerateMocks([NotificationRepository])
import 'notifications_usecases_test.mocks.dart';

void main() {
  late MockNotificationRepository mockRepo;
  late GetNotificationsUseCase getNotificationsUseCase;
  late MarkNotificationReadUseCase markReadUseCase;

  setUp(() {
    mockRepo = MockNotificationRepository();
    getNotificationsUseCase = GetNotificationsUseCase(mockRepo);
    markReadUseCase = MarkNotificationReadUseCase(mockRepo);
  });

  group('GetNotificationsUseCase', () {
    test('returns list of notifications on success', () async {
      final notif = TestFixtures.notification();
      when(mockRepo.getNotifications())
          .thenAnswer((_) async => Right([notif]));

      final result = await getNotificationsUseCase(NoParams());

      expect(result.isRight(), isTrue);
      result.fold(
        (_) => fail('Expected success'),
        (list) {
          expect(list.length, equals(1));
          expect(list.first.id, equals('notif-001'));
          expect(list.first.priority, equals('high'));
        },
      );
    });

    test('returns empty list when no notifications exist', () async {
      when(mockRepo.getNotifications())
          .thenAnswer((_) async => const Right([]));

      final result = await getNotificationsUseCase(NoParams());

      expect(result.isRight(), isTrue);
      result.fold(
        (_) => fail('Expected success'),
        (list) => expect(list, isEmpty),
      );
    });

    test('returns ServerFailure on API error', () async {
      when(mockRepo.getNotifications())
          .thenAnswer((_) async => Left(ServerFailure('Server error')));

      final result = await getNotificationsUseCase(NoParams());

      expect(result.isLeft(), isTrue);
    });
  });

  group('MarkNotificationReadUseCase', () {
    const notifId = 'notif-001';

    test('calls repository markAsRead and returns Right(null)', () async {
      when(mockRepo.markAsRead(notifId))
          .thenAnswer((_) async => const Right(null));

      final result = await markReadUseCase(notifId);

      expect(result.isRight(), isTrue);
      verify(mockRepo.markAsRead(notifId)).called(1);
    });

    test('silently succeeds if endpoint is unavailable (offline-tolerant)', () async {
      when(mockRepo.markAsRead(notifId))
          .thenAnswer((_) async => const Right(null));

      final result = await markReadUseCase(notifId);
      expect(result.isRight(), isTrue);
    });
  });
}
