import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/field_visits/domain/entities/field_visit_entity.dart';

abstract class FieldVisitRepository {
  Future<Either<Failure, List<FieldVisitEntity>>> getFieldVisits();
}
