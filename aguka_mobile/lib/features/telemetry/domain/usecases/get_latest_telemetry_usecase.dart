import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';
import 'package:aguka_mobile/features/telemetry/domain/repositories/telemetry_repository.dart';

class GetLatestTelemetryUseCase implements UseCase<TelemetryEntity, String> {
  final TelemetryRepository repository;

  GetLatestTelemetryUseCase(this.repository);

  @override
  Future<Either<Failure, TelemetryEntity>> call(String farmId) async {
    try {
      final telemetry = await repository.getLatestReading(farmId);
      return Right(telemetry);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
