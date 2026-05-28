import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/dashboard_summary.dart';

abstract class DashboardRepository {
  Future<Either<Failure, DashboardSummary>> getDashboardSummary(String farmId);
}
