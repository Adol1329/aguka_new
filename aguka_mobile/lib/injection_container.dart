import 'package:get_it/get_it.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

// Core
import 'package:aguka_mobile/core/utils/preferences_helper.dart';
import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/core/network/network_info.dart';
import 'package:aguka_mobile/core/bloc/navigation/navigation_cubit.dart';
import 'package:aguka_mobile/data/datasources/remote/socket_client.dart';
import 'package:aguka_mobile/services/firebase_service.dart';

// Shared
import 'package:aguka_mobile/shared/bloc/filter/filter_bloc.dart';
import 'package:aguka_mobile/shared/data/local/sync_service.dart';

// Features - Auth
import 'package:aguka_mobile/features/auth/data/datasources/auth_remote_data_source.dart';
import 'package:aguka_mobile/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/register_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/logout_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/check_auth_status_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/onboarding_usecase.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';

// Features - Dashboard
import 'package:aguka_mobile/features/dashboard/data/datasources/dashboard_remote_data_source.dart';
import 'package:aguka_mobile/features/dashboard/data/repositories/dashboard_repository_impl.dart';
import 'package:aguka_mobile/features/dashboard/domain/repositories/dashboard_repository.dart';
import 'package:aguka_mobile/features/dashboard/domain/usecases/get_dashboard_summary.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/dashboard_bloc.dart';

// Features - Telemetry
import 'package:aguka_mobile/features/telemetry/data/datasources/telemetry_remote_data_source.dart';
import 'package:aguka_mobile/features/telemetry/data/repositories/telemetry_repository_impl.dart';
import 'package:aguka_mobile/features/telemetry/domain/repositories/telemetry_repository.dart';
import 'package:aguka_mobile/features/telemetry/domain/usecases/telemetry_subscription_usecases.dart';
import 'package:aguka_mobile/features/telemetry/domain/usecases/get_latest_telemetry_usecase.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_bloc.dart';

// Features - Irrigation
import 'package:aguka_mobile/features/irrigation/data/datasources/irrigation_remote_data_source.dart';
import 'package:aguka_mobile/features/irrigation/data/datasources/irrigation_local_data_source.dart';
import 'package:aguka_mobile/features/irrigation/data/repositories/irrigation_repository_impl.dart';
import 'package:aguka_mobile/features/irrigation/domain/repositories/irrigation_repository.dart';
import 'package:aguka_mobile/features/irrigation/domain/usecases/get_irrigation_status_usecase.dart';
import 'package:aguka_mobile/features/irrigation/domain/usecases/control_pump_usecase.dart';
import 'package:aguka_mobile/features/irrigation/presentation/bloc/irrigation_bloc.dart';

// Features - Notifications
import 'package:aguka_mobile/features/notifications/data/datasources/notification_remote_data_source.dart';
import 'package:aguka_mobile/features/notifications/data/datasources/notification_local_data_source.dart';
import 'package:aguka_mobile/features/notifications/data/repositories/notification_repository_impl.dart';
import 'package:aguka_mobile/features/notifications/domain/repositories/notification_repository.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/get_notifications_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_notification_read_usecase.dart';
import 'package:aguka_mobile/features/notifications/domain/usecases/mark_all_notifications_read_usecase.dart';
import 'package:aguka_mobile/features/notifications/presentation/bloc/notifications_bloc.dart';

// Local Database
import 'package:aguka_mobile/shared/data/local/database_helper.dart';

// Features - Reports
import 'package:aguka_mobile/features/reports/data/datasources/reports_remote_data_source.dart';
import 'package:aguka_mobile/features/reports/data/repositories/reports_repository_impl.dart';
import 'package:aguka_mobile/features/reports/domain/repositories/reports_repository.dart';
import 'package:aguka_mobile/features/reports/domain/usecases/get_report_analytics_usecase.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_cubit.dart';

// Features - Cooperatives
import 'package:aguka_mobile/features/cooperatives/data/datasources/cooperative_remote_data_source.dart';
import 'package:aguka_mobile/features/cooperatives/data/repositories/cooperative_repository_impl.dart';
import 'package:aguka_mobile/features/cooperatives/domain/repositories/cooperative_repository.dart';
import 'package:aguka_mobile/features/cooperatives/domain/usecases/cooperative_usecases.dart';
import 'package:aguka_mobile/features/cooperatives/bloc/cooperative_cubit.dart';
import 'package:aguka_mobile/features/profile/presentation/profile_cubit.dart';
import 'package:aguka_mobile/features/activities/data/datasources/activity_remote_data_source.dart';
import 'package:aguka_mobile/features/activities/data/repositories/activity_repository_impl.dart';
import 'package:aguka_mobile/features/activities/domain/repositories/activity_repository.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_bloc.dart';
import 'package:aguka_mobile/features/community/data/datasources/forum_remote_data_source.dart';
import 'package:aguka_mobile/features/community/data/repositories/forum_repository_impl.dart';
import 'package:aguka_mobile/features/community/domain/repositories/forum_repository.dart';
import 'package:aguka_mobile/features/community/presentation/bloc/forum_bloc.dart';
import 'package:aguka_mobile/features/guidance/data/datasources/guidance_remote_data_source.dart';
import 'package:aguka_mobile/features/guidance/data/repositories/guidance_repository_impl.dart';
import 'package:aguka_mobile/features/guidance/domain/repositories/guidance_repository.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_bloc.dart';

final sl = GetIt.instance;

Future<void> init() async {
  //! Core / External
  final sharedPreferences = await SharedPreferences.getInstance();
  final prefsHelper = PreferencesHelper(sharedPreferences);
  await prefsHelper.loadSecureValues();
  sl.registerLazySingleton(() => prefsHelper);

  final dioClient = DioClient(prefsHelper);
  sl.registerLazySingleton(() => dioClient.dio);

  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl(Connectivity()));
  sl.registerLazySingleton(() => SocketClient(prefsHelper));
  sl.registerLazySingleton(() => SyncService(sl()));
  sl.registerLazySingleton(() => FirebaseService());

  //! Navigation & Shared BLoCs
  sl.registerLazySingleton(() => NavigationCubit(sl()));
  sl.registerFactory(() => FilterBloc());

  //! Features - Auth
  // Data sources
  sl.registerLazySingleton<AuthRemoteDataSource>(() => AuthRemoteDataSourceImpl(sl()));
  // Repository
  sl.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(
        remoteDataSource: sl(),
        preferencesHelper: sl(),
        socketClient: sl(),
      ));
  // Use cases
  sl.registerLazySingleton(() => LoginUseCase(sl()));
  sl.registerLazySingleton(() => RegisterUseCase(sl()));
  sl.registerLazySingleton(() => LogoutUseCase(sl()));
  sl.registerLazySingleton(() => GetCurrentUserUseCase(sl()));
  sl.registerLazySingleton(() => CheckAuthStatusUseCase(sl()));
  sl.registerLazySingleton(() => OnboardingUseCase(sl()));
  // Bloc
  sl.registerFactory(() => AuthBloc(
        loginUseCase: sl(),
        registerUseCase: sl(),
        logoutUseCase: sl(),
        getCurrentUserUseCase: sl(),
        checkAuthStatusUseCase: sl(),
        onboardingUseCase: sl(),
      ));

  //! Features - Dashboard
  // Data sources
  sl.registerLazySingleton<DashboardRemoteDataSource>(() => DashboardRemoteDataSourceImpl(sl()));
  // Repository
  sl.registerLazySingleton<DashboardRepository>(() => DashboardRepositoryImpl(remoteDataSource: sl()));
  // Use cases
  sl.registerLazySingleton(() => GetDashboardSummaryUseCase(sl()));
  // Bloc
  sl.registerFactory(() => DashboardBloc(getDashboardSummary: sl()));

  //! Features - Telemetry
  // Data sources
  sl.registerLazySingleton<TelemetryRemoteDataSource>(() => TelemetryRemoteDataSourceImpl(
    socketClient: sl(),
    dioClient: dioClient,
  ));
  // Repository
  sl.registerLazySingleton<TelemetryRepository>(() => TelemetryRepositoryImpl(remoteDataSource: sl()));
  // Use cases
  sl.registerLazySingleton(() => SubscribeToTelemetryUseCase(sl()));
  sl.registerLazySingleton(() => UnsubscribeFromTelemetryUseCase(sl()));
  sl.registerLazySingleton(() => GetLatestTelemetryUseCase(sl()));
  // Bloc
  sl.registerFactory(() => TelemetryBloc(
    subscribeUseCase: sl(),
    unsubscribeUseCase: sl(),
    getLatestUseCase: sl(),
  ));

  //! Features - Irrigation
  // Data sources
  sl.registerLazySingleton<IrrigationRemoteDataSource>(() => IrrigationRemoteDataSourceImpl(dioClient: dioClient));
  sl.registerLazySingleton<IrrigationLocalDataSource>(() => IrrigationLocalDataSourceImpl(databaseHelper: DatabaseHelper.instance));
  // Repository
  sl.registerLazySingleton<IrrigationRepository>(() => IrrigationRepositoryImpl(
    remoteDataSource: sl(),
    localDataSource: sl(),
    networkInfo: sl(),
  ));
  // Use cases
  sl.registerLazySingleton(() => GetIrrigationStatusUseCase(sl()));
  sl.registerLazySingleton(() => ControlPumpUseCase(sl()));
  // Bloc
  sl.registerFactory(() => IrrigationBloc(
    getStatusUseCase: sl(),
    controlPumpUseCase: sl(),
  ));

  //! Features - Notifications
  // Data sources
  sl.registerLazySingleton<NotificationRemoteDataSource>(() => NotificationRemoteDataSourceImpl(dioClient: dioClient));
  sl.registerLazySingleton<NotificationLocalDataSource>(() => NotificationLocalDataSourceImpl(databaseHelper: DatabaseHelper.instance));
  // Repository
  sl.registerLazySingleton<NotificationRepository>(() => NotificationRepositoryImpl(
    remoteDataSource: sl(),
    localDataSource: sl(),
    networkInfo: sl(),
  ));
  // Use cases
  sl.registerLazySingleton(() => GetNotificationsUseCase(sl()));
  sl.registerLazySingleton(() => MarkNotificationReadUseCase(sl()));
  sl.registerLazySingleton(() => MarkAllNotificationsReadUseCase(sl()));
  // Bloc
  sl.registerFactory(() => NotificationsBloc(
    getNotificationsUseCase: sl(),
    markNotificationReadUseCase: sl(),
    markAllNotificationsReadUseCase: sl(),
  ));

  //! Features - Reports
  sl.registerLazySingleton<ReportsRemoteDataSource>(() => ReportsRemoteDataSourceImpl(dioClient: dioClient));
  sl.registerLazySingleton<ReportsRepository>(() => ReportsRepositoryImpl(remoteDataSource: sl()));
  sl.registerLazySingleton(() => GetReportAnalyticsUseCase(sl()));
  sl.registerFactory(() => ReportsBloc(getAnalyticsUseCase: sl()));

  //! Features - Cooperatives
  sl.registerLazySingleton<CooperativeRemoteDataSource>(() => CooperativeRemoteDataSourceImpl(dioClient: dioClient));
  sl.registerLazySingleton<CooperativeRepository>(() => CooperativeRepositoryImpl(remoteDataSource: sl()));
  sl.registerLazySingleton(() => GetMyCooperativeUseCase(sl()));
  sl.registerLazySingleton(() => GetCooperativeMembersUseCase(sl()));
  sl.registerLazySingleton(() => AddCooperativeMemberUseCase(sl()));
  sl.registerFactory(() => CooperativeBloc(
    getMyCooperativeUseCase: sl(),
    getMembersUseCase: sl(),
    addMemberUseCase: sl(),
  ));

  //! Features - Profile
  sl.registerFactory(() => ProfileCubit(repository: sl()));

  //! Features - Activities
  sl.registerLazySingleton<ActivityRemoteDataSource>(
    () => ActivityRemoteDataSourceImpl(dioClient: dioClient),
  );
  sl.registerLazySingleton<ActivityRepository>(
    () => ActivityRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory(() => ActivityBloc(repository: sl()));

  //! Features - Community Forum
  sl.registerLazySingleton<ForumRemoteDataSource>(
    () => ForumRemoteDataSourceImpl(dioClient: dioClient),
  );
  sl.registerLazySingleton<ForumRepository>(
    () => ForumRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory(() => ForumBloc(repository: sl()));

  //! Features - Guidance
  sl.registerLazySingleton<GuidanceRemoteDataSource>(
    () => GuidanceRemoteDataSourceImpl(dioClient: dioClient),
  );
  sl.registerLazySingleton<GuidanceRepository>(
    () => GuidanceRepositoryImpl(remoteDataSource: sl()),
  );
  sl.registerFactory(() => GuidanceBloc(repository: sl()));
}
