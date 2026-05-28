import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_notification_read_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_all_notifications_read_usecase.dart';
import 'notifications_event.dart';
import 'notifications_state.dart';

class NotificationsBloc extends Bloc<NotificationsEvent, NotificationsState> {
  final GetNotificationsUseCase _getNotificationsUseCase;
  final MarkNotificationReadUseCase _markNotificationReadUseCase;
  final MarkAllNotificationsReadUseCase _markAllNotificationsReadUseCase;
  Timer? _pollingTimer;

  NotificationsBloc({
    required GetNotificationsUseCase getNotificationsUseCase,
    required MarkNotificationReadUseCase markNotificationReadUseCase,
    required MarkAllNotificationsReadUseCase markAllNotificationsReadUseCase,
  })  : _getNotificationsUseCase = getNotificationsUseCase,
        _markNotificationReadUseCase = markNotificationReadUseCase,
        _markAllNotificationsReadUseCase = markAllNotificationsReadUseCase,
        super(const NotificationsState()) {
    on<FetchNotifications>(_onFetchNotifications);
    on<MarkNotificationAsRead>(_onMarkAsRead);
    on<MarkAllNotificationsAsRead>(_onMarkAllAsRead);

    // Start polling for new notifications (Firebase trigger fallback)
    _startPolling();
  }

  void _startPolling() {
    _pollingTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (!isClosed) {
        add(FetchNotifications());
      }
    });
  }

  @override
  Future<void> close() {
    _pollingTimer?.cancel();
    return super.close();
  }

  Future<void> _onFetchNotifications(FetchNotifications event, Emitter<NotificationsState> emit) async {
    emit(state.copyWith(status: NotificationsStatus.loading));
    
    final result = await _getNotificationsUseCase(NoParams());
    
    result.fold(
      (failure) => emit(state.copyWith(
        status: NotificationsStatus.error,
        errorMessage: failure.message,
      )),
      (notifications) => emit(state.copyWith(
        status: NotificationsStatus.loaded,
        notifications: notifications,
      )),
    );
  }

  Future<void> _onMarkAsRead(MarkNotificationAsRead event, Emitter<NotificationsState> emit) async {
    final result = await _markNotificationReadUseCase(event.notificationId);
    
    result.fold(
      (failure) => emit(state.copyWith(
        status: NotificationsStatus.error,
        errorMessage: failure.message,
      )),
      (_) {
        final updated = state.notifications
            .map((notification) => notification.id == event.notificationId
                ? notification.copyWith(readAt: DateTime.now())
                : notification)
            .toList();
        emit(state.copyWith(status: NotificationsStatus.loaded, notifications: updated));
      },
    );
  }

  Future<void> _onMarkAllAsRead(
    MarkAllNotificationsAsRead event,
    Emitter<NotificationsState> emit,
  ) async {
    final result = await _markAllNotificationsReadUseCase(NoParams());

    result.fold(
      (failure) => emit(state.copyWith(
        status: NotificationsStatus.error,
        errorMessage: failure.message,
      )),
      (_) {
        final now = DateTime.now();
        final updated = state.notifications
            .map((notification) => notification.copyWith(readAt: now))
            .toList();
        emit(state.copyWith(status: NotificationsStatus.loaded, notifications: updated));
      },
    );
  }
}
