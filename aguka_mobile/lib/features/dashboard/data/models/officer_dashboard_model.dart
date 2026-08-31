import 'package:aguka_mobile/features/dashboard/domain/entities/officer_dashboard_data.dart';

class OfficerDashboardModel extends OfficerDashboardData {
  const OfficerDashboardModel({
    super.assignedFarmers,
    super.farmsMonitored,
    super.pendingVisits,
    super.activeRisks,
    super.recentActivities,
  });

  factory OfficerDashboardModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? {};
    final stats = data['stats'] as Map<String, dynamic>? ?? {};
    final List<dynamic> rawActivities = data['recentActivities'] ?? [];

    final activities = rawActivities.map((a) {
      final activity = a as Map<String, dynamic>;
      final dateStr = activity['activityDate'] != null
          ? _formatDate(DateTime.tryParse(activity['activityDate'] as String))
          : '';
      return RecentActivityItem(
        title: activity['farmerName'] ?? 'Unknown',
        subtitle: activity['activityType'] ?? dateStr,
        icon: 'check_circle',
      );
    }).toList();

    return OfficerDashboardModel(
      assignedFarmers: (stats['assignedFarmers'] ?? 0) as int,
      farmsMonitored: (stats['farmsMonitored'] ?? 0) as int,
      pendingVisits: (stats['pendingVisits'] ?? 0) as int,
      activeRisks: (stats['activeRisks'] ?? 0) as int,
      recentActivities: activities,
    );
  }

  static String _formatDate(DateTime? dt) {
    if (dt == null) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return '${dt.day} ${months[dt.month - 1]} ${dt.year}';
  }
}
