import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../entities/irrigation_status.dart';
import '../repositories/irrigation_repository.dart';

class ControlPumpUseCase implements UseCase<IrrigationStatus, ControlPumpParams> {
  final IrrigationRepository repository;

  ControlPumpUseCase(this.repository);

  @override
  Future<Either<Failure, IrrigationStatus>> call(ControlPumpParams params) async {
    return await repository.controlPump(params.farmId, params.isActive);
  }
}

class ControlPumpParams extends Equatable {
  final String farmId;
  final bool isActive;

  const ControlPumpParams({required this.farmId, required this.isActive});

  @override
  List<Object?> get props => [farmId, isActive];
}
