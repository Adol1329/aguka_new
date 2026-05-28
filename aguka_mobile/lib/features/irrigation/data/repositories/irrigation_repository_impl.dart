import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/network/network_info.dart';
import 'package:aguka_mobile/features/irrigation/domain/entities/irrigation_status.dart';
import 'package:aguka_mobile/features/irrigation/domain/repositories/irrigation_repository.dart';
import 'package:aguka_mobile/features/irrigation/data/datasources/irrigation_remote_data_source.dart';
import 'package:aguka_mobile/features/irrigation/data/datasources/irrigation_local_data_source.dart';
import 'package:aguka_mobile/features/irrigation/data/models/irrigation_status_model.dart';

class IrrigationRepositoryImpl implements IrrigationRepository {
  final IrrigationRemoteDataSource remoteDataSource;
  final IrrigationLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  IrrigationRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, IrrigationStatus>> getStatus(String farmId) async {
    if (await networkInfo.isConnected) {
      try {
        final remoteStatus = await remoteDataSource.getStatus(farmId);
        return Right(remoteStatus);
      } on ServerException {
        return Left(ServerFailure('Failed to fetch irrigation status'));
      }
    } else {
      // Return cached/offline status (mocked for now, can be read from DB later)
      return Right(IrrigationStatusModel(
        isPumpActive: false,
        waterUsed: 145.0,
        percentageSaved: 20.0,
      ));
    }
  }

  @override
  Future<Either<Failure, IrrigationStatus>> controlPump(String farmId, bool isActive) async {
    if (await networkInfo.isConnected) {
      try {
        final result = await remoteDataSource.controlPump(farmId, isActive);
        return Right(result);
      } on ServerException {
        // Even if server fails, we might want to queue it if it's a temporary error,
        // but let's just queue it for offline mode for now.
        return Left(ServerFailure('Failed to control pump'));
      }
    } else {
      // Queue the mutation locally
      await localDataSource.queuePumpControl(farmId, isActive);
      // Return optimistic state
      return Right(IrrigationStatusModel(
        isPumpActive: isActive,
        lastTapTime: DateTime.now(),
        waterUsed: 145.0,
        percentageSaved: 20.0,
      ));
    }
  }
}
