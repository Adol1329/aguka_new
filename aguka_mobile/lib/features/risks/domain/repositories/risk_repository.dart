import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/risks/domain/entities/risk_entity.dart';

abstract class RiskRepository {
  Future<Either<Failure, List<RiskEntity>>> getActiveRisks();
}
