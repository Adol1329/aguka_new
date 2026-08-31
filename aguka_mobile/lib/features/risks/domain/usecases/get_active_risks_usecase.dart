import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/risks/domain/entities/risk_entity.dart';
import 'package:aguka_mobile/features/risks/domain/repositories/risk_repository.dart';

class GetActiveRisksUseCase implements UseCase<List<RiskEntity>, NoParams> {
  final RiskRepository repository;

  GetActiveRisksUseCase(this.repository);

  @override
  Future<Either<Failure, List<RiskEntity>>> call(NoParams params) async {
    return await repository.getActiveRisks();
  }
}
