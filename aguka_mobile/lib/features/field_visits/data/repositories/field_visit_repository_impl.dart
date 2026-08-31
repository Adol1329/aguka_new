import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/field_visits/data/datasources/field_visit_remote_data_source.dart';
import 'package:aguka_mobile/features/field_visits/domain/entities/field_visit_entity.dart';
import 'package:aguka_mobile/features/field_visits/domain/repositories/field_visit_repository.dart';

class FieldVisitRepositoryImpl implements FieldVisitRepository {
  final FieldVisitRemoteDataSource remoteDataSource;

  FieldVisitRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<FieldVisitEntity>>> getFieldVisits() async {
    try {
      final visits = await remoteDataSource.getFieldVisits();
      return Right(visits);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
