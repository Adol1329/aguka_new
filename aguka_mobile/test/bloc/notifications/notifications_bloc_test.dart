import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_notification_read_usecase.dart';
import 'package:aguka_mobile/features/notifications/presentation/bloc/notifications_bloc.dart';
import 'package:aguka_mobile/features/notifications/presentation/bloc/notifications_event.dart';
import 'package:aguka_mobile/features/notifications/presentation/bloc/notifications_state.dart';
import '../../helpers/test_fixtures.dart';

@GenerateMocks([GetNotificationsUseCase, MarkNotificationReadUseCase])
import 'notifications_bloc_test.mocks.dart';

void main() {
  late MockGetNotificationsUseCase mockGetUseCase;
  late MockMarkNotificationReadUseCase mockMarkReadUseCase;

  setUp(() {
    mockGetUseCase = MockGetNotificationsUseCase();
    mockMarkReadUseCase = MockMarkNotificationReadUseCase();
  });

  NotificationsBloc buildBloc() => NotificationsBloc(
        getNotificationsUseCase: mockGetUseCase,
        markNotificationReadUseCase: mockMarkReadUseCase,
      );

  test('initial state has status == initial', () {
    expect(buildBloc().state.status, equals(NotificationsStatus.initial));
  });

  group('FetchNotifications', () {
    blocTest<NotificationsBloc, NotificationsState>(
      'emits [loading, loaded] with notifications on success',
      build: buildBloc,
      setUp: () {
        when(mockGetUseCase(NoParams()))
            .thenAnswer((_) async => Right([TestFixtures.notification()]));
      },
      act: (bloc) => bloc.add(FetchNotifications()),
      expect: () => [
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.loading),
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.loaded),
      ],
      verify: (bloc) {
        expect(bloc.state.notifications.length, equals(1));
        expect(bloc.state.notifications.first.title, equals('Low Soil Moisture'));
      },
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'emits [loading, loaded] with empty list when no notifications',
      build: buildBloc,
      setUp: () {
        when(mockGetUseCase(NoParams()))
            .thenAnswer((_) async => const Right([]));
      },
      act: (bloc) => bloc.add(FetchNotifications()),
      expect: () => [
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.loading),
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.loaded),
      ],
      verify: (bloc) {
        expect(bloc.state.notifications, isEmpty);
      },
    );

    blocTest<NotificationsBloc, NotificationsState>(
      'emits [loading, error] on API failure',
      build: buildBloc,
      setUp: () {
        when(mockGetUseCase(NoParams()))
            .thenAnswer((_) async => Left(ServerFailure('Connection error')));
      },
      act: (bloc) => bloc.add(FetchNotifications()),
      expect: () => [
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.loading),
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.error),
      ],
      verify: (bloc) {
        expect(bloc.state.errorMessage, contains('Connection error'));
      },
    );
  });

  group('MarkNotificationAsRead', () {
    blocTest<NotificationsBloc, NotificationsState>(
      'marks notification as read in the current list',
      build: buildBloc,
      seed: () => NotificationsState(
        status: NotificationsStatus.loaded,
        notifications: [TestFixtures.notification(isRead: false)],
      ),
      setUp: () {
        when(mockMarkReadUseCase('notif-001'))
            .thenAnswer((_) async => const Right(null));
        when(mockGetUseCase(NoParams()))
            .thenAnswer((_) async => Right([TestFixtures.notification(isRead: true)]));
      },
      act: (bloc) => bloc.add(const MarkNotificationAsRead('notif-001')),
      expect: () => [
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.loading),
        predicate<NotificationsState>((s) => s.status == NotificationsStatus.loaded),
      ],
      verify: (bloc) {
        expect(bloc.state.notifications.first.isRead, isTrue);
      },
    );
  });
}
