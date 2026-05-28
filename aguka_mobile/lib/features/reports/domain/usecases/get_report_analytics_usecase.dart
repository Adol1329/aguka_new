import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../entities/report_entity.dart';
import '../repositories/reports_repository.dart';

class GetReportAnalyticsUseCase implements UseCase<ReportAnalyticsEntity, NoParams> {
  final ReportsRepository repository;

  GetReportAnalyticsUseCase(this.repository);

  @override
  Future<Either<Failure, ReportAnalyticsEntity>> call(NoParams params) async {
    return await repository.getAnalytics();
  }
}
