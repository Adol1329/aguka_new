import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/cooperative_entity.dart';

abstract class CooperativeRepository {
  Future<Either<Failure, CooperativeEntity>> getMyCooperative();
  Future<Either<Failure, List<CooperativeMemberEntity>>> getMembers(String cooperativeId);
  Future<Either<Failure, void>> addMember(String cooperativeId, String phone, String fullName);
  Future<Either<Failure, List<JoinRequestEntity>>> getJoinRequests(String cooperativeId);
  Future<Either<Failure, void>> approveJoinRequest(String cooperativeId, String requestId);
  Future<Either<Failure, void>> rejectJoinRequest(String cooperativeId, String requestId);
  Future<Either<Failure, List<CooperativeActivityEntity>>> getActivities(String cooperativeId);
  Future<Either<Failure, void>> createActivity(String cooperativeId, Map<String, dynamic> data);
  Future<Either<Failure, List<CooperativeResourceEntity>>> getResources(String cooperativeId);
  Future<Either<Failure, void>> addResource(String cooperativeId, Map<String, dynamic> data);
  Future<Either<Failure, List<CooperativeListItemEntity>>> getCooperativeList();
  Future<Either<Failure, void>> requestMembership(String cooperativeId);
}
