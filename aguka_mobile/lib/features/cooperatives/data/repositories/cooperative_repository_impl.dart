import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';
import 'package:aguka_mobile/features/cooperatives/domain/repositories/cooperative_repository.dart';
import '../datasources/cooperative_remote_data_source.dart';

class CooperativeRepositoryImpl implements CooperativeRepository {
  final CooperativeRemoteDataSource remoteDataSource;

  CooperativeRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, CooperativeEntity>> getMyCooperative() async {
    try {
      final result = await remoteDataSource.getMyCooperative();
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<CooperativeMemberEntity>>> getMembers(String cooperativeId) async {
    try {
      final result = await remoteDataSource.getMembers(cooperativeId);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> addMember(
      String cooperativeId, String phone, String fullName) async {
    try {
      await remoteDataSource.addMember(cooperativeId, phone, fullName);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<JoinRequestEntity>>> getJoinRequests(String cooperativeId) async {
    try {
      final result = await remoteDataSource.getJoinRequests(cooperativeId);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> approveJoinRequest(
      String cooperativeId, String requestId) async {
    try {
      await remoteDataSource.approveJoinRequest(cooperativeId, requestId);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> rejectJoinRequest(
      String cooperativeId, String requestId) async {
    try {
      await remoteDataSource.rejectJoinRequest(cooperativeId, requestId);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<CooperativeActivityEntity>>> getActivities(
      String cooperativeId) async {
    try {
      final result = await remoteDataSource.getActivities(cooperativeId);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> createActivity(
      String cooperativeId, Map<String, dynamic> data) async {
    try {
      await remoteDataSource.createActivity(cooperativeId, data);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<CooperativeResourceEntity>>> getResources(
      String cooperativeId) async {
    try {
      final result = await remoteDataSource.getResources(cooperativeId);
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> addResource(
      String cooperativeId, Map<String, dynamic> data) async {
    try {
      await remoteDataSource.addResource(cooperativeId, data);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<CooperativeListItemEntity>>> getCooperativeList() async {
    try {
      final result = await remoteDataSource.getCooperativeList();
      return Right(result);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> requestMembership(String cooperativeId) async {
    try {
      await remoteDataSource.requestMembership(cooperativeId);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
