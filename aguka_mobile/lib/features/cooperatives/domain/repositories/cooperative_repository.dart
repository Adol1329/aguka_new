import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/cooperative_entity.dart';

abstract class CooperativeRepository {
  Future<Either<Failure, CooperativeEntity>> getMyCooperative();
  Future<Either<Failure, List<CooperativeMemberEntity>>> getMembers(String cooperativeId);
  Future<Either<Failure, void>> addMember(String cooperativeId, String phone, String fullName);
}
