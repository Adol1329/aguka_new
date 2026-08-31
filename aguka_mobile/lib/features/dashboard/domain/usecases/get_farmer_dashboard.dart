import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/farmer_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/repositories/dashboard_repository.dart';

class GetFarmerDashboardUseCase implements UseCase<FarmerDashboardData, NoParams> {
  final DashboardRepository repository;

  GetFarmerDashboardUseCase(this.repository);

  @override
  Future<Either<Failure, FarmerDashboardData>> call(NoParams params) {
    return repository.getFarmerDashboard();
  }
}
