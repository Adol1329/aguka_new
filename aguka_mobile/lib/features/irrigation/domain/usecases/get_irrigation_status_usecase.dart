import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../entities/irrigation_status.dart';
import '../repositories/irrigation_repository.dart';

class GetIrrigationStatusUseCase implements UseCase<IrrigationStatus, String> {
  final IrrigationRepository repository;

  GetIrrigationStatusUseCase(this.repository);

  @override
  Future<Either<Failure, IrrigationStatus>> call(String farmId) async {
    return await repository.getStatus(farmId);
  }
}
