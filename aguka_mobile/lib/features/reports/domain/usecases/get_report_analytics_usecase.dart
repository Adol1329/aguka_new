import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/report_entity.dart';
import '../repositories/reports_repository.dart';

class GetReportAnalyticsUseCase {
  final ReportsRepository repository;

  GetReportAnalyticsUseCase(this.repository);

  Future<Either<Failure, ReportAnalyticsEntity>> call(String role) async {
    return await repository.getAnalytics(role);
  }
}
