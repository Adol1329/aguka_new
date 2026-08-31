import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/core/navigation/nav_models.dart';
import 'package:aguka_mobile/core/bloc/navigation/navigation_cubit.dart';
import 'package:aguka_mobile/features/dashboard/presentation/bloc/farmer_dashboard_bloc.dart';
import 'package:aguka_mobile/features/dashboard/presentation/widgets/dashboard_cards.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_bloc.dart';
import 'package:aguka_mobile/features/activities/presentation/bloc/activity_event.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_bloc.dart';
import 'package:aguka_mobile/features/guidance/presentation/bloc/guidance_event.dart';
import 'package:aguka_mobile/features/activities/presentation/pages/activities_page.dart';
import 'package:aguka_mobile/features/guidance/presentation/pages/guidance_page.dart';
import 'package:aguka_mobile/features/community/presentation/community_page.dart';
import 'package:aguka_mobile/features/notifications/presentation/pages/notifications_page.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/farmer_dashboard_data.dart';

class FarmerDashboardContent extends StatelessWidget {
  const FarmerDashboardContent({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<FarmerDashboardBloc, FarmerDashboardState>(
      builder: (context, state) {
        final data = state.data;
        final isLoading = state.status == FarmerDashboardStatus.loading ||
            state.status == FarmerDashboardStatus.initial;

        if (state.status == FarmerDashboardStatus.error) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.cloud_off, size: 56, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text(
                    state.errorMessage ?? 'common.error'.tr(),
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(height: 20),
                  ElevatedButton.icon(
                    onPressed: () => context.read<FarmerDashboardBloc>().add(FetchFarmerDashboard()),
                    icon: const Icon(Icons.refresh),
                    label: Text('common.retry'.tr()),
                  ),
                ],
              ),
            ),
          );
        }

        return RefreshIndicator(
          onRefresh: () async {
            context.read<FarmerDashboardBloc>().add(FetchFarmerDashboard());
            context.read<ActivityBloc>().add(FetchActivities());
            context.read<GuidanceBloc>().add(FetchGuidanceOverview());
          },
          child: isLoading
              ? const Center(child: CircularProgressIndicator())
              : ListView(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  children: [
                    _buildFarmHeader(context, data),
                    const SizedBox(height: 16),
                    _buildStatGrid(context, data),
                    const SizedBox(height: 6),
                    _buildSensorTimestamp(data),
                    const SizedBox(height: 20),
                    _buildCropSection(context),
                    const SizedBox(height: 20),
                    _buildMonitoringSection(context, data),
                    const SizedBox(height: 20),
                    _buildQuickActionsSection(context),
                    const SizedBox(height: 20),
                    _buildCommunitySection(context),
                    const SizedBox(height: 20),
                    _buildRecentActivities(context),
                  ],
                ),
        );
      },
    );
  }

  Widget _buildFarmHeader(BuildContext context, FarmerDashboardData data) {
    final authState = context.watch<AuthBloc>().state;
    String name = data.farmer.fullName.isNotEmpty
        ? data.farmer.fullName
        : authState is AuthAuthenticated
            ? (authState.user.fullName ?? 'farmer.title'.tr())
            : 'farmer.title'.tr();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          '${'common.hello'.tr()}, $name',
          style: const TextStyle(fontSize: 16, color: Colors.grey),
        ),
        const SizedBox(height: 4),
        Text(
          'dashboard.title'.tr(),
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }

  Widget _buildStatGrid(BuildContext context, FarmerDashboardData data) {
    final soil = data.soilLatest;
    final hasSoil = soil.hasData;
    final moisture = soil.moisture;
    final temp = soil.temperature;
    final ph = soil.ph;
    final weather = data.weather;
    final weatherTemp = weather.temperature;
    final condition = weather.condition.isNotEmpty ? weather.condition : '--';

    String moistureLabel = hasSoil
        ? (moisture >= 60
            ? 'soil.status_optimal'.tr()
            : moisture >= 30
                ? 'soil.status_moderate'.tr()
                : 'soil.status_low'.tr())
        : '--';
    Color moistureColor = hasSoil
        ? (moisture >= 60
            ? const Color(0xFF1D9E75)
            : moisture >= 30
                ? const Color(0xFFE67E22)
                : const Color(0xFFE74C3C))
        : Colors.grey;

    String tempLabel = hasSoil
        ? (temp >= 15 && temp <= 35
            ? 'soil.status_normal'.tr()
            : 'soil.status_extreme'.tr())
        : '--';
    Color tempColor = hasSoil
        ? (temp >= 15 && temp <= 35
            ? const Color(0xFFE67E22)
            : const Color(0xFFE74C3C))
        : Colors.grey;

    String phLabel = hasSoil
        ? (ph >= 5.5 && ph <= 7.5
            ? 'soil.status_healthy'.tr()
            : 'soil.status_needs_attention'.tr())
        : '--';
    Color phColor = hasSoil
        ? (ph >= 5.5 && ph <= 7.5
            ? const Color(0xFF3498DB)
            : const Color(0xFFE74C3C))
        : Colors.grey;

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 1.5,
      children: [
        StatCard(
          label: 'soil.moisture'.tr(),
          value: hasSoil ? '${moisture.toStringAsFixed(0)}%' : '--',
          subtitle: moistureLabel,
          icon: Icons.water_drop,
          color: moistureColor,
        ),
        StatCard(
          label: 'soil.temp'.tr(),
          value: hasSoil ? '${temp.toStringAsFixed(1)}°C' : '--',
          subtitle: tempLabel,
          icon: Icons.thermostat,
          color: tempColor,
        ),
        StatCard(
          label: 'soil.ph'.tr(),
          value: hasSoil ? ph.toStringAsFixed(1) : '--',
          subtitle: phLabel,
          icon: Icons.science,
          color: phColor,
        ),
        StatCard(
          label: 'weather.title'.tr(),
          value: '${weatherTemp.toStringAsFixed(0)}°C',
          subtitle: condition,
          icon: Icons.wb_sunny,
          color: const Color(0xFFF39C12),
        ),
      ],
    );
  }

  Widget _buildSensorTimestamp(FarmerDashboardData data) {
    final soil = data.soilLatest;
    String label;
    if (soil.hasData && soil.recordedAt.isNotEmpty) {
      final recorded = DateTime.tryParse(soil.recordedAt);
      if (recorded != null) {
        label = 'Last updated ${_timeAgo(recorded)} · IoT Simulation Active';
      } else {
        label = 'IoT Simulation Active';
      }
    } else {
      label = 'No sensor readings yet — simulation will generate data shortly';
    }
    return Text(
      label,
      style: TextStyle(fontSize: 11, color: Colors.grey[500]),
    );
  }

  String _timeAgo(DateTime dt) {
    final diff = DateTime.now().difference(dt);
    if (diff.inMinutes < 1) return 'just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    return '${diff.inDays}d ago';
  }

  Widget _buildCropSection(BuildContext context) {
    return BlocBuilder<FarmerDashboardBloc, FarmerDashboardState>(
      builder: (context, state) {
        final crops = state.data.crops;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionHeader(
              title: 'crops.title'.tr(),
              linkLabel: 'common.view_all'.tr(),
              onLinkTap: () => context.read<NavigationCubit>().navigateTo(NavItem.activities),
            ),
            const SizedBox(height: 10),
            if (crops.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Text(
                  'crops.empty'.tr(),
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: crops.take(5).map((crop) => _cropRow(crop)).toList(),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _cropRow(CropInfo crop) {
    final cs = _computeCropStatus(crop);

    final planted = DateTime.tryParse(crop.plantedDate);
    final plantedLabel = planted != null
        ? 'Planted ${DateFormat('d MMM yyyy').format(planted)}'
        : '';

    final parts = <String>[];
    if (crop.cropCategory.isNotEmpty) parts.add(crop.cropCategory);
    if (crop.areaHectares > 0) parts.add('${crop.areaHectares} ha');
    if (crop.location.isNotEmpty) parts.add(crop.location);
    final subtitle = parts.join(' · ');

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: cs.dotColor, shape: BoxShape.circle),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        crop.cropName.isNotEmpty ? crop.cropName : '--',
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (subtitle.isNotEmpty)
                      Flexible(
                        child: Text(
                          ' · $subtitle',
                          style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                  ],
                ),
                if (plantedLabel.isNotEmpty)
                  Text(
                    plantedLabel,
                    style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                  ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: cs.badgeBg,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              cs.label,
              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: cs.badgeText),
            ),
          ),
        ],
      ),
    );
  }

  _CropStatus _computeCropStatus(CropInfo crop) {
    final status = crop.status.toLowerCase();
    final planted = DateTime.tryParse(crop.plantedDate);

    if (planted != null && (status == 'growing' || status == 'planted')) {
      final expectedHarvest = planted.add(Duration(days: crop.growingDurationDays));
      final now = DateTime.now();
      final daysToHarvest = expectedHarvest.difference(now).inDays;
      final daysPlanted = now.difference(planted).inDays;

      if (daysToHarvest < 0) {
        return _CropStatus(
          label: 'OVERDUE · ${daysToHarvest.abs()}d',
          dotColor: const Color(0xFF791F1F),
          badgeBg: const Color(0xFFFCEBEB),
          badgeText: const Color(0xFF791F1F),
        );
      } else if (daysToHarvest <= 14) {
        return _CropStatus(
          label: 'READY · ${daysToHarvest}d',
          dotColor: const Color(0xFF854F0B),
          badgeBg: const Color(0xFFFAEEDA),
          badgeText: const Color(0xFF854F0B),
        );
      } else {
        return _CropStatus(
          label: 'GROWING · ${daysPlanted}d',
          dotColor: const Color(0xFF0F6E56),
          badgeBg: const Color(0xFFE1F5EE),
          badgeText: const Color(0xFF0F6E56),
        );
      }
    } else if (status == 'failed') {
      return _CropStatus(
        label: 'FAILED',
        dotColor: const Color(0xFF791F1F),
        badgeBg: const Color(0xFFFCEBEB),
        badgeText: const Color(0xFF791F1F),
      );
    } else if (status == 'dormant') {
      return _CropStatus(
        label: 'DORMANT',
        dotColor: const Color(0xFF64748B),
        badgeBg: const Color(0xFFF1F5F9),
        badgeText: const Color(0xFF64748B),
      );
    } else if (status == 'harvested') {
      return _CropStatus(
        label: 'HARVESTED',
        dotColor: const Color(0xFF0369A1),
        badgeBg: const Color(0xFFE0F2FE),
        badgeText: const Color(0xFF0369A1),
      );
    }
    return _CropStatus(
      label: status.isNotEmpty ? status.toUpperCase() : 'UNKNOWN',
      dotColor: Colors.grey,
      badgeBg: Colors.grey[200]!,
      badgeText: Colors.grey[700]!,
    );
  }

  Widget _buildMonitoringSection(BuildContext context, FarmerDashboardData data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(title: 'monitoring.title'.tr()),
        const SizedBox(height: 10),
        _buildSoilMoistureChart(context, data),
        const SizedBox(height: 12),
        _buildWeatherForecast(context, data),
      ],
    );
  }

  Widget _buildSoilMoistureChart(BuildContext context, FarmerDashboardData data) {
    final trend = data.soilTrend.length > 7
        ? data.soilTrend.sublist(data.soilTrend.length - 7)
        : data.soilTrend;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.show_chart, size: 18, color: Color(0xFF1D9E75)),
              const SizedBox(width: 6),
              Text(
                'monitoring.soil_trend'.tr(),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (trend.isEmpty)
            SizedBox(
              height: 100,
              child: Center(
                child: Text(
                  'No soil data yet',
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
              ),
            )
          else
            SizedBox(
              height: 130,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: trend.map((point) {
                  final barHeight = (point.moisture * 0.8).clamp(4.0, 80.0);
                  final dayName = _shortDayName(point.recordedAt);
                  return Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Text(
                          '${point.moisture.toStringAsFixed(0)}%',
                          style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 4),
                        Container(
                          height: barHeight,
                          margin: const EdgeInsets.symmetric(horizontal: 3),
                          decoration: BoxDecoration(
                            gradient: const LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [Color(0xFF60BDE8), Color(0xFF3498DB)],
                            ),
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(4),
                              topRight: Radius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          dayName,
                          style: TextStyle(fontSize: 9, color: Colors.grey[500]),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildWeatherForecast(BuildContext context, FarmerDashboardData data) {
    final forecast = data.weather.forecast.take(5).toList();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.cloud, size: 18, color: Color(0xFF3498DB)),
              const SizedBox(width: 6),
              Text(
                'monitoring.forecast'.tr(),
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 12),
          if (forecast.isEmpty)
            SizedBox(
              height: 80,
              child: Center(
                child: Text(
                  'No forecast data',
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
              ),
            )
          else
            Column(
              children: forecast.map((w) => _forecastRow(w)).toList(),
            ),
        ],
      ),
    );
  }

  Widget _forecastRow(dynamic w) {
    final Map<String, dynamic> entry = w is Map<String, dynamic> ? w : {};
    final rainChance = (entry['rainChance'] as num?)?.toInt() ?? 0;
    final high = (entry['high'] as num?)?.toInt() ?? 0;
    final condition = entry['condition']?.toString() ?? '';
    final day = entry['day']?.toString() ?? '';
    final dayName = day.isNotEmpty ? _shortDayFromIso(day) : '--';
    final emoji = rainChance > 50 ? '🌧️' : '☀️';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Text(emoji, style: const TextStyle(fontSize: 22)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(dayName, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                if (condition.isNotEmpty)
                  Text(condition, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('$high°', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
              Text(
                '$rainChance% rain',
                style: const TextStyle(fontSize: 11, color: Color(0xFF3498DB)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _shortDayName(String isoDate) {
    final dt = DateTime.tryParse(isoDate);
    if (dt == null) return '--';
    return DateFormat('EEE').format(dt);
  }

  String _shortDayFromIso(String isoDate) {
    final dt = DateTime.tryParse(isoDate);
    if (dt == null) return isoDate.length >= 3 ? isoDate.substring(0, 3) : isoDate;
    return DateFormat('EEE').format(dt);
  }

  Widget _buildQuickActionsSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(title: 'quick_actions.title'.tr()),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: ActionTile(
                label: 'quick_actions.my_crops'.tr(),
                icon: Icons.eco,
                color: const Color(0xFF1D9E75),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ActivitiesPage()),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: ActionTile(
                label: 'quick_actions.expert_guides'.tr(),
                icon: Icons.menu_book,
                color: const Color(0xFF8E44AD),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const GuidancePage()),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCommunitySection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(title: 'community.section_title'.tr()),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: ActionTile(
                label: 'community.farmer_community'.tr(),
                icon: Icons.people,
                color: const Color(0xFF2ECC71),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const CommunityPage()),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: ActionTile(
                label: 'notifications.title'.tr(),
                icon: Icons.notifications,
                color: const Color(0xFFE74C3C),
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const NotificationsPage()),
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildRecentActivities(BuildContext context) {
    return BlocBuilder<FarmerDashboardBloc, FarmerDashboardState>(
      builder: (context, state) {
        final activities = state.data.recentActivities;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SectionHeader(
              title: 'recent_activities.title'.tr(),
              linkLabel: 'common.view_all'.tr(),
              onLinkTap: () => context.read<NavigationCubit>().navigateTo(NavItem.activities),
            ),
            const SizedBox(height: 10),
            if (activities.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Text(
                  'recent_activities.empty'.tr(),
                  style: TextStyle(color: Colors.grey[500], fontSize: 13),
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey[200]!),
                ),
                child: Column(
                  children: activities.take(5).map((a) => Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: _activityRow(a),
                  )).toList(),
                ),
              ),
          ],
        );
      },
    );
  }

  Widget _activityRow(FarmerActivityItem activity) {
    final daysAgo = activity.activityDate.isNotEmpty
        ? DateTime.now().difference(DateTime.tryParse(activity.activityDate) ?? DateTime.now()).inDays
        : 0;
    final timeLabel = daysAgo == 0
        ? 'common.today'.tr()
        : daysAgo == 1
            ? 'common.yesterday'.tr()
            : 'common.days_ago'.tr(args: ['$daysAgo']);

    IconData icon;
    Color color;
    switch (activity.activityType.toLowerCase()) {
      case 'fertilization':
        icon = Icons.spa;
        color = const Color(0xFF1D9E75);
        break;
      case 'irrigation':
        icon = Icons.water_drop;
        color = const Color(0xFF3498DB);
        break;
      case 'planting':
        icon = Icons.eco;
        color = const Color(0xFF27AE60);
        break;
      case 'harvesting':
        icon = Icons.agriculture;
        color = const Color(0xFFE67E22);
        break;
      default:
        icon = Icons.assignment;
        color = const Color(0xFF7F8C8D);
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(icon, size: 16, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  activity.cropName != null && activity.cropName!.isNotEmpty
                      ? '${activity.activityType} · ${activity.cropName}'
                      : activity.activityType,
                  style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13),
                ),
                if (activity.notes != null && activity.notes!.isNotEmpty)
                  Text(
                    activity.notes!,
                    style: TextStyle(fontSize: 11, color: Colors.grey[600]),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
              ],
            ),
          ),
          Text(
            timeLabel,
            style: TextStyle(fontSize: 10, color: Colors.grey[500]),
          ),
        ],
      ),
    );
  }
}

class _CropStatus {
  final String label;
  final Color dotColor;
  final Color badgeBg;
  final Color badgeText;

  const _CropStatus({
    required this.label,
    required this.dotColor,
    required this.badgeBg,
    required this.badgeText,
  });
}
