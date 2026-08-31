import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../repositories/reports_repository.dart';

class DownloadReportUseCase {
  final ReportsRepository repository;

  DownloadReportUseCase(this.repository);

  Future<Either<Failure, String>> call(String role, String type) async {
    return await repository.downloadReport(role, type);
  }
}
