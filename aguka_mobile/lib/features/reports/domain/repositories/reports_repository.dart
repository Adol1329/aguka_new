import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/report_entity.dart';

abstract class ReportsRepository {
  Future<Either<Failure, ReportAnalyticsEntity>> getAnalytics();
  Future<Either<Failure, String>> downloadReport(String type);
}
