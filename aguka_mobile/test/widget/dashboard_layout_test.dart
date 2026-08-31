import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';

import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:aguka_mobile/core/bloc/navigation/navigation_cubit.dart';
import 'package:aguka_mobile/core/navigation/nav_models.dart';
import 'package:aguka_mobile/core/navigation/nav_registry.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/farmer_dashboard.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/officer_dashboard.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/cooperative_dashboard.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/dashboard_summary.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/widgets/app_drawer.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_bloc.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_event.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_state.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_event.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_state.dart';
import 'package:aguka_mobile/features/field_visits/presentation/bloc/field_visit_bloc.dart';
import 'package:aguka_mobile/features/risks/presentation/bloc/risk_bloc.dart';
import 'package:aguka_mobile/features/cooperatives/bloc/cooperative_cubit.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';
import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/officer_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/cooperative_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/farmer_dashboard_bloc.dart';

class MockAuthBloc extends MockBloc<AuthEvent, AuthState> implements AuthBloc {}
class MockNavigationCubit extends MockCubit<NavigationState> implements NavigationCubit {}
class MockDashboardBloc extends MockBloc<DashboardEvent, DashboardState> implements DashboardBloc {}
class MockGuidanceBloc extends MockBloc<GuidanceEvent, GuidanceState> implements GuidanceBloc {}
class MockActivityBloc extends MockBloc<ActivityEvent, ActivityState> implements ActivityBloc {}
class MockFieldVisitBloc extends MockBloc<FieldVisitEvent, FieldVisitState> implements FieldVisitBloc {}
class MockRiskBloc extends MockBloc<RiskEvent, RiskState> implements RiskBloc {}
class MockCooperativeBloc extends MockBloc<CooperativeEvent, CooperativeState> implements CooperativeBloc {}
class MockOfficerDashboardBloc extends MockBloc<OfficerDashboardEvent, OfficerDashboardState> implements OfficerDashboardBloc {}
class MockCooperativeDashboardBloc extends MockBloc<CooperativeDashboardEvent, CooperativeDashboardState> implements CooperativeDashboardBloc {}
class MockFarmerDashboardBloc extends MockBloc<FarmerDashboardEvent, FarmerDashboardState> implements FarmerDashboardBloc {}

final _npk = NPKEntity(n: 45, p: 30, k: 25);
final _telemetry = TelemetryEntity(
  soilMoisture: 62.5,
  temperature: 24.0,
  ph: 6.5,
  npk: _npk,
  weather: const WeatherEntity(
    tempC: 22.0,
    humidity: 65.0,
    rainfall: 0.0,
    condition: 'Partly Cloudy',
  ),
  timestamp: DateTime(2026, 5, 15, 9, 0),
);
final _dashboardSummary = DashboardSummary(
  telemetry: _telemetry,
  source: 'api',
  isCritical: false,
);

final _farmerUser = UserEntity(
  id: 'user-farmer-001',
  phone: '+250788000001',
  fullName: 'Amina Uwase',
  role: 'farmer',
  language: 'en',
  isActive: true,
);
final _officerUser = UserEntity(
  id: 'user-officer-001',
  phone: '+250788000002',
  fullName: 'Patrick Habimana',
  role: 'extension_officer',
  language: 'en',
  isActive: true,
);
final _coopUser = UserEntity(
  id: 'user-coop-001',
  phone: '+250788000003',
  fullName: 'Diane Mukarwego',
  role: 'cooperative_manager',
  language: 'en',
  isActive: true,
);

final _navState = NavigationState(
  currentItem: NavItem.dashboard,
  index: 0,
  availableTabs: NavRegistry.getTabsForRole('farmer'),
);

Widget buildTestApp({
  required Widget child,
  required UserEntity user,
  double width = 320,
  double height = 640,
}) {
  final authBloc = MockAuthBloc();
  final authenticated = AuthAuthenticated(user: user);
  whenListen(authBloc, Stream.value(authenticated), initialState: authenticated);

  final navCubit = MockNavigationCubit();
  whenListen(navCubit, Stream.value(_navState), initialState: _navState);

  final dashBloc = MockDashboardBloc();
  final dashLoaded = DashboardLoaded(_dashboardSummary);
  whenListen(dashBloc, Stream.value(dashLoaded), initialState: dashLoaded);

  final guidanceBloc = MockGuidanceBloc();
  final guidanceInitial = const GuidanceState();
  whenListen(guidanceBloc, Stream.value(guidanceInitial), initialState: guidanceInitial);

  final activityBloc = MockActivityBloc();
  final activityInitial = const ActivityState();
  whenListen(activityBloc, Stream.value(activityInitial), initialState: activityInitial);

  final fvBloc = MockFieldVisitBloc();
  final fvInitial = const FieldVisitState();
  whenListen(fvBloc, Stream.value(fvInitial), initialState: fvInitial);

  final riskBloc = MockRiskBloc();
  final riskInitial = const RiskState();
  whenListen(riskBloc, Stream.value(riskInitial), initialState: riskInitial);

  final coopBloc = MockCooperativeBloc();
  final coopInitial = const CooperativeState();
  whenListen(coopBloc, Stream.value(coopInitial), initialState: coopInitial);

  final officerDashBloc = MockOfficerDashboardBloc();
  final officerDashInitial = const OfficerDashboardState();
  whenListen(officerDashBloc, Stream.value(officerDashInitial), initialState: officerDashInitial);

  final coopDashBloc = MockCooperativeDashboardBloc();
  final coopDashInitial = const CooperativeDashboardState();
  whenListen(coopDashBloc, Stream.value(coopDashInitial), initialState: coopDashInitial);

  final farmerDashBloc = MockFarmerDashboardBloc();
  final farmerDashInitial = const FarmerDashboardState();
  whenListen(farmerDashBloc, Stream.value(farmerDashInitial), initialState: farmerDashInitial);

  return MaterialApp(
    home: MultiBlocProvider(
      providers: [
        BlocProvider<AuthBloc>.value(value: authBloc),
        BlocProvider<NavigationCubit>.value(value: navCubit),
        BlocProvider<DashboardBloc>.value(value: dashBloc),
        BlocProvider<GuidanceBloc>.value(value: guidanceBloc),
        BlocProvider<ActivityBloc>.value(value: activityBloc),
        BlocProvider<FieldVisitBloc>.value(value: fvBloc),
        BlocProvider<RiskBloc>.value(value: riskBloc),
        BlocProvider<CooperativeBloc>.value(value: coopBloc),
        BlocProvider<OfficerDashboardBloc>.value(value: officerDashBloc),
        BlocProvider<CooperativeDashboardBloc>.value(value: coopDashBloc),
        BlocProvider<FarmerDashboardBloc>.value(value: farmerDashBloc),
      ],
      child: MediaQuery(
        data: MediaQueryData(size: Size(width, height), devicePixelRatio: 2),
        child: child,
      ),
    ),
  );
}

void main() {
  group('AgukaAppBar', () {
    testWidgets('title renders at 320dp without overflow', (tester) async {
      await tester.pumpWidget(buildTestApp(
        user: _farmerUser,
        child: Scaffold(
          appBar: AgukaAppBar(title: 'Dashboard', showProfileInfo: true),
          body: const SizedBox.shrink(),
        ),
      ));
      await tester.pump();
      expect(tester.takeException(), isNull);
    });

    testWidgets('greeting shows first name without truncation', (tester) async {
      await tester.pumpWidget(buildTestApp(
        user: _farmerUser,
        child: Scaffold(
          appBar: AgukaAppBar(title: 'Dashboard', showProfileInfo: true),
          body: const SizedBox.shrink(),
        ),
      ));
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(find.textContaining('Amina'), findsOneWidget);
    });
  });

  group('AppDrawer', () {
    testWidgets('no overflow at 320dp for any role', (tester) async {
      await tester.pumpWidget(buildTestApp(
        user: _farmerUser,
        child: const Scaffold(
          drawer: AppDrawer(),
          body: SizedBox.shrink(),
        ),
      ));
      await tester.pump();
      expect(tester.takeException(), isNull);

      await tester.pumpWidget(buildTestApp(
        user: _officerUser,
        child: const Scaffold(
          drawer: AppDrawer(),
          body: SizedBox.shrink(),
        ),
      ));
      await tester.pump();
      expect(tester.takeException(), isNull);

      await tester.pumpWidget(buildTestApp(
        user: _coopUser,
        child: const Scaffold(
          drawer: AppDrawer(),
          body: SizedBox.shrink(),
        ),
      ));
      await tester.pump();
      expect(tester.takeException(), isNull);
    });
  });

  group('Farmer Dashboard Content', () {
    testWidgets('no overflow at 320dp', (tester) async {
      await tester.pumpWidget(buildTestApp(
        user: _farmerUser,
        child: const Scaffold(body: FarmerDashboardContent()),
      ));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(tester.takeException(), isNull);
    });
  });

  group('Officer Dashboard Content', () {
    testWidgets('no overflow at 320dp', (tester) async {
      await tester.pumpWidget(buildTestApp(
        user: _officerUser,
        child: const Scaffold(body: OfficerDashboardContent()),
      ));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(tester.takeException(), isNull);
    });
  });

  group('Cooperative Dashboard Content', () {
    testWidgets('no overflow at 320dp', (tester) async {
      await tester.pumpWidget(buildTestApp(
        user: _coopUser,
        child: const Scaffold(body: CooperativeDashboardContent()),
      ));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(tester.takeException(), isNull);
    });

    testWidgets('displays cooperative name when loaded', (tester) async {
      final coopBloc = MockCooperativeBloc();
      final coopInitial = const CooperativeState();
      final coopLoaded = CooperativeState(
        status: CooperativeStatus.loaded,
        cooperative: CooperativeEntity(
          id: 'coop-1',
          name: 'Test Coop',
          registrationNumber: 'RN001',
          memberCount: 10,
        ),
        members: [
          CooperativeMemberEntity(
            id: 'm1',
            userId: 'u1',
            fullName: 'Alice',
            phone: '+250788000001',
            role: 'farmer',
            status: 'active',
            joinedAt: DateTime(2026, 1, 1),
          ),
        ],
      );
      whenListen(coopBloc, Stream.fromIterable([coopLoaded]), initialState: coopInitial);

      await tester.pumpWidget(MaterialApp(
        home: MultiBlocProvider(
          providers: [
            BlocProvider<AuthBloc>.value(
              value: () {
                final b = MockAuthBloc();
                final s = AuthAuthenticated(user: _coopUser);
                whenListen(b, Stream.fromIterable([s]), initialState: s);
                return b;
              }(),
            ),
            BlocProvider<NavigationCubit>.value(
              value: () {
                final c = MockNavigationCubit();
                whenListen(c, Stream.fromIterable([_navState]), initialState: _navState);
                return c;
              }(),
            ),
            BlocProvider<DashboardBloc>.value(
              value: () {
                final b = MockDashboardBloc();
                final s = DashboardLoaded(_dashboardSummary);
                whenListen(b, Stream.fromIterable([s]), initialState: s);
                return b;
              }(),
            ),
            BlocProvider<GuidanceBloc>.value(
              value: () {
                final b = MockGuidanceBloc();
                whenListen(b, Stream.fromIterable([]), initialState: const GuidanceState());
                return b;
              }(),
            ),
            BlocProvider<ActivityBloc>.value(
              value: () {
                final b = MockActivityBloc();
                whenListen(b, Stream.fromIterable([]), initialState: const ActivityState());
                return b;
              }(),
            ),
            BlocProvider<FieldVisitBloc>.value(
              value: () {
                final b = MockFieldVisitBloc();
                whenListen(b, Stream.fromIterable([]), initialState: const FieldVisitState());
                return b;
              }(),
            ),
            BlocProvider<RiskBloc>.value(
              value: () {
                final b = MockRiskBloc();
                whenListen(b, Stream.fromIterable([]), initialState: const RiskState());
                return b;
              }(),
            ),
            BlocProvider<CooperativeBloc>.value(value: coopBloc),
            BlocProvider<OfficerDashboardBloc>.value(
              value: () {
                final b = MockOfficerDashboardBloc();
                whenListen(b, Stream.fromIterable([]), initialState: const OfficerDashboardState());
                return b;
              }(),
            ),
            BlocProvider<CooperativeDashboardBloc>.value(
              value: () {
                final b = MockCooperativeDashboardBloc();
                whenListen<CooperativeDashboardState>(b, Stream.fromIterable(<CooperativeDashboardState>[]), initialState: const CooperativeDashboardState());
                return b;
              }(),
            ),
          ],
          child: const MediaQuery(
            data: MediaQueryData(size: Size(400, 800), devicePixelRatio: 2),
            child: Scaffold(body: CooperativeDashboardContent()),
          ),
        ),
      ));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 50));
      expect(tester.takeException(), isNull);
      expect(find.text('Test Coop'), findsOneWidget);
      expect(find.text('10'), findsOneWidget);
    });
  });
}
