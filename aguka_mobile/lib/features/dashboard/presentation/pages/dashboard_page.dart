import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/dashboard_bloc.dart';
import 'package:aguka_mobile/features/telemetry/presentation/soil_page.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:aguka_mobile/shared/bloc/filter/filter_bloc.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/features/telemetry/presentation/weather_page.dart';
import 'package:aguka_mobile/features/irrigation/presentation/pages/irrigation_page.dart';
import 'package:aguka_mobile/features/community/presentation/community_page.dart';
import 'package:aguka_mobile/features/notifications/presentation/pages/notifications_page.dart';
import 'package:aguka_mobile/features/activities/presentation/pages/activities_page.dart';
import 'package:aguka_mobile/features/guidance/presentation/pages/guidance_page.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) {
        final bloc = sl<DashboardBloc>();
        final authState = context.read<AuthBloc>().state;
        if (authState is AuthAuthenticated) {
          bloc.add(LoadDashboardData(authState.user.id));
        }
        return bloc;
      },
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
            if (authState is AuthAuthenticated) {
              context.read<DashboardBloc>().add(LoadDashboardData(authState.user.id));
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
            if (state is DashboardError) {
              return _buildErrorState(context, state.message);
            }
            if (state is DashboardLoaded) {
              return _buildContent(context, state);
            }
            return const SizedBox.shrink();
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
        IconButton(
          icon: const Icon(Icons.notifications_outlined),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const NotificationsPage()),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.sync),
          onPressed: () {
            final authState = context.read<AuthBloc>().state;
            if (authState is AuthAuthenticated) {
              context.read<DashboardBloc>().add(LoadDashboardData(authState.user.id));
            }
          },
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

  Widget _buildContent(BuildContext context, DashboardLoaded state) {
    return RefreshIndicator(
      onRefresh: () async {
        final authState = context.read<AuthBloc>().state;
        if (authState is AuthAuthenticated) {
          context.read<DashboardBloc>().add(LoadDashboardData(authState.user.id));
        }
      },
      child: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          _buildWeatherSummary(state),
          const SizedBox(height: 16),
          _buildSoilSummary(state, context),
          const SizedBox(height: 16),
          _buildQuickActions(context),
        ],
      ),
    );
  }

  Widget _buildWeatherSummary(DashboardLoaded state) {
    final weather = state.summary.telemetry.weather;
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('dashboard.current_weather'.tr(), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text('${weather.tempC}°C - ${weather.condition}', style: const TextStyle(color: Colors.grey)),
              ],
            ),
            const Icon(Icons.wb_sunny, color: Colors.orange, size: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSoilSummary(DashboardLoaded state, BuildContext context) {
    final telemetry = state.summary.telemetry;
    final isCritical = state.summary.isCritical;

    return Card(
      elevation: 2,
      color: isCritical ? Colors.red[50] : Colors.green[50],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: isCritical ? Colors.red[200]! : Colors.green[200]!),
      ),
      child: ListTile(
        leading: Icon(isCritical ? Icons.warning : Icons.check_circle, color: isCritical ? Colors.red : Colors.green),
        title: Text(
          isCritical ? 'dashboard.critical_alert'.tr() : 'dashboard.optimal_status'.tr(), 
          style: TextStyle(fontWeight: FontWeight.bold, color: isCritical ? Colors.red : Colors.green[800])
        ),
        subtitle: Text('${'soil.moisture'.tr()}: ${telemetry.soilMoisture.toStringAsFixed(1)}%.'),
        trailing: isCritical ? ElevatedButton(
          style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const IrrigationPage()),
          ),
          child: Text('dashboard.water_now'.tr(), style: const TextStyle(color: Colors.white)),
        ) : null,
      ),
    );
  }

  Widget _buildQuickActions(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        _buildActionCard(context, 'dashboard.soil_health'.tr(), Icons.grass, Colors.green, const SoilPage()),
        _buildActionCard(context, 'dashboard.irrigation'.tr(), Icons.water_drop, Colors.blue, const IrrigationPage()),
        _buildActionCard(context, 'dashboard.weather'.tr(), Icons.cloud, Colors.orange, const WeatherPage()),
        _buildActionCard(context, 'Activities', Icons.assignment, Colors.teal, const ActivitiesPage()),
        _buildActionCard(context, 'Guidance', Icons.menu_book, Colors.indigo, const GuidancePage()),
      ],
    );
  }

  Widget _buildActionCard(BuildContext context, String title, IconData icon, Color color, Widget page) {
    return InkWell(
      onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => page)),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: color),
            const SizedBox(height: 12),
            Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }
}
