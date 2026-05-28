import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/irrigation_status.dart';

abstract class IrrigationRepository {
  Future<Either<Failure, IrrigationStatus>> getStatus(String farmId);
  Future<Either<Failure, IrrigationStatus>> controlPump(String farmId, bool isActive);
}
