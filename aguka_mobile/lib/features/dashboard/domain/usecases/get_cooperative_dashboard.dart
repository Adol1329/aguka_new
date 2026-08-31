import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/cooperative_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/repositories/dashboard_repository.dart';

class GetCooperativeDashboardUseCase
    implements UseCase<CooperativeDashboardData, String> {
  final DashboardRepository repository;

  GetCooperativeDashboardUseCase(this.repository);

  @override
  Future<Either<Failure, CooperativeDashboardData>> call(String cooperativeId) {
    return repository.getCooperativeDashboard(cooperativeId);
  }
}
