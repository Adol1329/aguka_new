import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/risks/data/datasources/risk_remote_data_source.dart';
import 'package:aguka_mobile/features/risks/domain/entities/risk_entity.dart';
import 'package:aguka_mobile/features/risks/domain/repositories/risk_repository.dart';

class RiskRepositoryImpl implements RiskRepository {
  final RiskRemoteDataSource remoteDataSource;

  RiskRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<RiskEntity>>> getActiveRisks() async {
    try {
      final risks = await remoteDataSource.getActiveRisks();
      return Right(risks);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
