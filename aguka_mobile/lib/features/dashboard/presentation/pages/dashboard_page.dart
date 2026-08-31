import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/officer_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/cooperative_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/farmer_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/farmer_dashboard.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/officer_dashboard.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/cooperative_dashboard.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/shared/bloc/filter/filter_bloc.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/features/notifications/presentation/pages/notifications_page.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_bloc.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_event.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_event.dart';
import 'package:aguka_mobile/features/cooperatives/bloc/cooperative_cubit.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';
import 'package:aguka_mobile/features/field_visits/presentation/bloc/field_visit_bloc.dart';
import 'package:aguka_mobile/features/risks/presentation/bloc/risk_bloc.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authState = context.read<AuthBloc>().state;
    final farmId = authState is AuthAuthenticated ? authState.user.id : '';
    final role = authState is AuthAuthenticated ? authState.user.role : '';

    return MultiBlocProvider(
      providers: [
        BlocProvider<DashboardBloc>(
          create: (context) {
            final bloc = sl<DashboardBloc>();
            if (farmId.isNotEmpty) bloc.add(LoadDashboardData(farmId));
            return bloc;
          },
        ),
        BlocProvider<ActivityBloc>(
          create: (_) {
            final bloc = sl<ActivityBloc>();
            if (role == 'farmer') bloc.add(FetchActivities());
            return bloc;
          },
        ),
        BlocProvider<GuidanceBloc>(
          create: (_) {
            final bloc = sl<GuidanceBloc>();
            if (role == 'farmer') bloc.add(FetchGuidanceOverview());
            return bloc;
          },
        ),
        BlocProvider<FieldVisitBloc>(
          create: (_) {
            final bloc = sl<FieldVisitBloc>();
            if (role == 'extension_officer') bloc.add(FetchFieldVisits());
            return bloc;
          },
        ),
        BlocProvider<RiskBloc>(
          create: (_) {
            final bloc = sl<RiskBloc>();
            if (role == 'extension_officer') bloc.add(FetchActiveRisks());
            return bloc;
          },
        ),
        BlocProvider<CooperativeBloc>(
          create: (_) {
            final bloc = sl<CooperativeBloc>();
            if (role == 'cooperative_manager') bloc.add(FetchMyCooperative());
            return bloc;
          },
        ),
        BlocProvider<OfficerDashboardBloc>(
          create: (_) {
            final bloc = sl<OfficerDashboardBloc>();
            if (role == 'extension_officer') bloc.add(FetchOfficerDashboard());
            return bloc;
          },
        ),
        BlocProvider<CooperativeDashboardBloc>(
          create: (_) => sl<CooperativeDashboardBloc>(),
        ),
        BlocProvider<FarmerDashboardBloc>(
          create: (_) {
            final bloc = sl<FarmerDashboardBloc>();
            if (role == 'farmer') bloc.add(FetchFarmerDashboard());
            return bloc;
          },
        ),
      ],
      child: const DashboardView(),
    );
  }
}

class DashboardView extends StatelessWidget {
  const DashboardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocListener(
      listeners: [
        BlocListener<FilterBloc, FilterState>(
          listener: (context, state) {
            final authState = context.read<AuthBloc>().state;
            final role = authState is AuthAuthenticated ? authState.user.role : '';
            final farmId = authState is AuthAuthenticated ? authState.user.id : '';
            if (farmId.isNotEmpty) {
              context.read<DashboardBloc>().add(LoadDashboardData(farmId));
              if (role == 'farmer') {
                context.read<ActivityBloc>().add(FetchActivities());
                context.read<GuidanceBloc>().add(FetchGuidanceOverview());
              }
              if (role == 'extension_officer') {
                context.read<FieldVisitBloc>().add(FetchFieldVisits());
                context.read<RiskBloc>().add(FetchActiveRisks());
                context.read<OfficerDashboardBloc>().add(FetchOfficerDashboard());
              }
              if (role == 'cooperative_manager') {
                context.read<CooperativeBloc>().add(FetchMyCooperative());
              }
              if (role == 'farmer') {
                context.read<FarmerDashboardBloc>().add(FetchFarmerDashboard());
              }
            }
          },
        ),
          BlocListener<CooperativeBloc, CooperativeState>(
            listener: (context, state) {
              if (state.status == CooperativeStatus.loaded && state.cooperative != null) {
                context.read<CooperativeDashboardBloc>().add(
                  FetchCooperativeDashboard(state.cooperative!.id),
                );
              }
            },
          ),
      ],
      child: Scaffold(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        appBar: _buildAppBar(context),
        body: BlocBuilder<DashboardBloc, DashboardState>(
          builder: (context, state) {
            if (state is DashboardLoading) {
              return const Center(child: CircularProgressIndicator());
            }
            // Show role content even if simulation/DashboardBloc errors —
            // each role dashboard handles its own loading/error state.
            return _buildRoleContent(context);
          },
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AgukaAppBar(
      title: 'dashboard.title'.tr(),
      showProfileInfo: true,
      actions: [
        Builder(
          builder: (context) => Semantics(
            label: 'notifications.title'.tr(),
            child: IconButton(
              icon: const Icon(Icons.notifications_outlined),
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const NotificationsPage()),
              ),
            ),
          ),
        ),
        Builder(
          builder: (context) => Semantics(
            label: 'Refresh',
            child: IconButton(
              icon: const Icon(Icons.sync),
              onPressed: () {
                final authState = context.read<AuthBloc>().state;
                final role = authState is AuthAuthenticated ? authState.user.role : '';
                final farmId = authState is AuthAuthenticated ? authState.user.id : '';
                if (farmId.isNotEmpty) {
                  context.read<DashboardBloc>().add(LoadDashboardData(farmId));
                  if (role == 'farmer') {
                    context.read<ActivityBloc>().add(FetchActivities());
                    context.read<GuidanceBloc>().add(FetchGuidanceOverview());
                  }
                  if (role == 'extension_officer') {
                    context.read<FieldVisitBloc>().add(FetchFieldVisits());
                    context.read<RiskBloc>().add(FetchActiveRisks());
                    context.read<OfficerDashboardBloc>().add(FetchOfficerDashboard());
                  }
                  if (role == 'cooperative_manager') {
                    context.read<CooperativeBloc>().add(FetchMyCooperative());
                  }
                  if (role == 'farmer') {
                    context.read<FarmerDashboardBloc>().add(FetchFarmerDashboard());
                  }
                }
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildErrorState(BuildContext context, String message) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 48, color: Colors.red),
          const SizedBox(height: 16),
          Text(message),
          ElevatedButton(
            onPressed: () {
              final authState = context.read<AuthBloc>().state;
              if (authState is AuthAuthenticated) {
                context.read<DashboardBloc>().add(LoadDashboardData(authState.user.id));
              }
            },
            child: const Text('Retry'),
          )
        ],
      ),
    );
  }

  Widget _buildRoleContent(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final role = authState is AuthAuthenticated ? authState.user.role : null;

    switch (role) {
      case 'farmer':
        return const FarmerDashboardContent();
      case 'extension_officer':
        return const OfficerDashboardContent();
      case 'cooperative_manager':
        return const CooperativeDashboardContent();
      default:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.phone_android, size: 64, color: Colors.grey[400]),
                const SizedBox(height: 16),
                Text(
                  'Mobile app is not available for this role.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 16, color: Colors.grey[600]),
                ),
                const SizedBox(height: 8),
                Text(
                  'Please use the web dashboard.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, color: Colors.grey[400]),
                ),
              ],
            ),
          ),
        );
    }
  }
}
