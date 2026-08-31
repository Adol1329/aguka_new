import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/data/datasources/remote/socket_client.dart';
import 'package:aguka_mobile/services/firebase_service.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_notification_read_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_all_notifications_read_usecase.dart';
import 'notifications_event.dart';
import 'notifications_state.dart';

class NotificationsBloc extends Bloc<NotificationsEvent, NotificationsState> {
  final GetNotificationsUseCase _getNotificationsUseCase;
  final MarkNotificationReadUseCase _markNotificationReadUseCase;
  final MarkAllNotificationsReadUseCase _markAllNotificationsReadUseCase;
  final SocketClient _socketClient;
  final FirebaseService _firebaseService;
  
  StreamSubscription? _socketSubscription;
  StreamSubscription? _fcmSubscription;

  NotificationsBloc({
    required GetNotificationsUseCase getNotificationsUseCase,
    required MarkNotificationReadUseCase markNotificationReadUseCase,
    required MarkAllNotificationsReadUseCase markAllNotificationsReadUseCase,
    required SocketClient socketClient,
    required FirebaseService firebaseService,
  })  : _getNotificationsUseCase = getNotificationsUseCase,
        _markNotificationReadUseCase = markNotificationReadUseCase,
        _markAllNotificationsReadUseCase = markAllNotificationsReadUseCase,
        _socketClient = socketClient,
        _firebaseService = firebaseService,
        super(const NotificationsState()) {
    on<FetchNotifications>(_onFetchNotifications);
    on<MarkNotificationAsRead>(_onMarkAsRead);
    on<MarkAllNotificationsAsRead>(_onMarkAllAsRead);

    // Subscribe to real-time updates
    _listenToRealTimeUpdates();
  }

  void _listenToRealTimeUpdates() {
    // Listen for socket events
    _socketSubscription = _socketClient.notificationStream.listen((_) {
      add(FetchNotifications());
    });

    // Listen for FCM foreground messages
    _fcmSubscription = _firebaseService.messageStream.listen((_) {
      add(FetchNotifications());
    });
  }

  @override
  Future<void> close() {
    _socketSubscription?.cancel();
    _fcmSubscription?.cancel();
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
