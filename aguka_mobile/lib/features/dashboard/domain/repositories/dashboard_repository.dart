import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/dashboard_summary.dart';
import '../entities/officer_dashboard_data.dart';
import '../entities/cooperative_dashboard_data.dart';
import '../entities/farmer_dashboard_data.dart';

abstract class DashboardRepository {
  Future<Either<Failure, DashboardSummary>> getDashboardSummary(String farmId);
  Future<Either<Failure, OfficerDashboardData>> getOfficerDashboard();
  Future<Either<Failure, CooperativeDashboardData>> getCooperativeDashboard(String cooperativeId);
  Future<Either<Failure, FarmerDashboardData>> getFarmerDashboard();
}
