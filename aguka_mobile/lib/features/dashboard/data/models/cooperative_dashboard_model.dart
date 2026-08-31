import 'package:aguka_mobile/features/dashboard/domain/entities/cooperative_dashboard_data.dart';

class CooperativeDashboardModel extends CooperativeDashboardData {
  const CooperativeDashboardModel({
    super.totalMembers,
    super.activeHectares,
    super.networkYield,
    super.sharedAssets,
    super.avgSoilMoisture,
    super.resourceUtilization,
    super.leaderboard,
    super.upcomingEvents,
  });

  factory CooperativeDashboardModel.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>? ?? {};
    final stats = data['stats'] as Map<String, dynamic>? ?? {};
    final network = data['networkOverview'] as Map<String, dynamic>? ?? {};
    final List<dynamic> rawEvents = data['upcomingEvents'] ?? [];
    final List<dynamic> rawLeaderboard = data['leaderboard'] ?? [];

    final events = rawEvents.map((e) {
      final event = e as Map<String, dynamic>;
      return UpcomingEventItem(
        id: event['id']?.toString() ?? '',
        title: event['title']?.toString() ?? '',
        description: event['description']?.toString(),
        scheduledAt: DateTime.tryParse(event['scheduledAt']?.toString() ?? '') ?? DateTime.now(),
        location: event['location']?.toString(),
      );
    }).toList();

    final leaderboard = rawLeaderboard.map((e) {
      final entry = e as Map<String, dynamic>;
      return LeaderboardEntry(
        farmerName: entry['farmerName']?.toString() ?? 'Unknown',
        totalCrops: (entry['totalCrops'] as num?)?.toInt() ?? 0,
        totalAreaHectares: (entry['totalAreaHectares'] as num?)?.toDouble() ?? 0,
        score: (entry['score'] as num?)?.toInt() ?? 0,
      );
    }).toList();

    return CooperativeDashboardModel(
      totalMembers: (stats['totalMembers'] as num?)?.toInt() ?? 0,
      // Backend sends float (e.g. 2.45) — use num cast to avoid TypeError.
      activeHectares: (stats['activeHectares'] as num?)?.toDouble() ?? 0,
      networkYield: (stats['networkYield'] as num?)?.toDouble() ?? 0,
      sharedAssets: (stats['sharedAssets'] as num?)?.toInt() ?? 0,
      avgSoilMoisture: (network['avgSoilMoisture'] as num?)?.toDouble() ?? 0,
      resourceUtilization: (network['resourceUtilization'] as num?)?.toInt() ?? 0,
      leaderboard: leaderboard,
      upcomingEvents: events,
    );
  }
}
