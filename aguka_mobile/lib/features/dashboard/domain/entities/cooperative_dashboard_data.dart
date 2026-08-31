import 'package:equatable/equatable.dart';

class CooperativeDashboardData extends Equatable {
  final int totalMembers;
  final double activeHectares;
  final double networkYield;
  final int sharedAssets;
  final double avgSoilMoisture;
  final int resourceUtilization;
  final List<LeaderboardEntry> leaderboard;
  final List<UpcomingEventItem> upcomingEvents;

  const CooperativeDashboardData({
    this.totalMembers = 0,
    this.activeHectares = 0,
    this.networkYield = 0,
    this.sharedAssets = 0,
    this.avgSoilMoisture = 0,
    this.resourceUtilization = 0,
    this.leaderboard = const [],
    this.upcomingEvents = const [],
  });

  @override
  List<Object?> get props => [
    totalMembers,
    activeHectares,
    networkYield,
    sharedAssets,
    avgSoilMoisture,
    resourceUtilization,
    leaderboard,
    upcomingEvents,
  ];
}

class LeaderboardEntry extends Equatable {
  final String farmerName;
  final int totalCrops;
  final double totalAreaHectares;
  final int score;

  const LeaderboardEntry({
    required this.farmerName,
    this.totalCrops = 0,
    this.totalAreaHectares = 0,
    this.score = 0,
  });

  @override
  List<Object?> get props => [farmerName, totalCrops, totalAreaHectares, score];
}

class UpcomingEventItem extends Equatable {
  final String id;
  final String title;
  final String? description;
  final DateTime scheduledAt;
  final String? location;

  const UpcomingEventItem({
    required this.id,
    required this.title,
    this.description,
    required this.scheduledAt,
    this.location,
  });

  @override
  List<Object?> get props => [id, title, description, scheduledAt, location];
}
