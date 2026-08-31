import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/officer_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/repositories/dashboard_repository.dart';

class GetOfficerDashboardUseCase implements UseCase<OfficerDashboardData, NoParams> {
  final DashboardRepository repository;

  GetOfficerDashboardUseCase(this.repository);

  @override
  Future<Either<Failure, OfficerDashboardData>> call(NoParams params) {
    return repository.getOfficerDashboard();
  }
}
