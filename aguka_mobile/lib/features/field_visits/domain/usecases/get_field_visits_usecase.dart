import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/field_visits/domain/entities/field_visit_entity.dart';
import 'package:aguka_mobile/features/field_visits/domain/repositories/field_visit_repository.dart';

class GetFieldVisitsUseCase implements UseCase<List<FieldVisitEntity>, NoParams> {
  final FieldVisitRepository repository;

  GetFieldVisitsUseCase(this.repository);

  @override
  Future<Either<Failure, List<FieldVisitEntity>>> call(NoParams params) async {
    return await repository.getFieldVisits();
  }
}
