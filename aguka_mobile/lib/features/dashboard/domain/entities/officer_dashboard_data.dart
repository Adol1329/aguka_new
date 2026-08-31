import 'package:equatable/equatable.dart';

class OfficerDashboardData extends Equatable {
  final int assignedFarmers;
  final int farmsMonitored;
  final int pendingVisits;
  final int activeRisks;
  final List<RecentActivityItem> recentActivities;

  const OfficerDashboardData({
    this.assignedFarmers = 0,
    this.farmsMonitored = 0,
    this.pendingVisits = 0,
    this.activeRisks = 0,
    this.recentActivities = const [],
  });

  @override
  List<Object?> get props => [assignedFarmers, farmsMonitored, pendingVisits, activeRisks, recentActivities];
}

class RecentActivityItem extends Equatable {
  final String title;
  final String subtitle;
  final String icon;

  const RecentActivityItem({
    required this.title,
    required this.subtitle,
    this.icon = 'check_circle',
  });

  @override
  List<Object?> get props => [title, subtitle, icon];
}
