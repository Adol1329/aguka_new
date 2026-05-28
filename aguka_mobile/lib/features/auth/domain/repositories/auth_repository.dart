import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import '../entities/user_entity.dart';

abstract class AuthRepository {
  Future<Either<Failure, UserEntity>> login({
    required String phone,
    required String password,
  });

  Future<Either<Failure, UserEntity>> register({
    required String phone,
    required String password,
    required String fullName,
    required String role,
    String? email,
    String? language,
  });

  Future<Either<Failure, UserEntity>> onboardFarmer(Map<String, dynamic> data);
  Future<Either<Failure, UserEntity>> onboardOfficer(Map<String, dynamic> data);
  Future<Either<Failure, UserEntity>> onboardCooperative(Map<String, dynamic> data);

  Future<Either<Failure, void>> logout();

  Future<Either<Failure, UserEntity>> getCurrentUser();

  Future<Either<Failure, UserEntity>> getProfile();

  Future<Either<Failure, UserEntity>> updateProfile({
    required String firstName,
    required String lastName,
    required String district,
    required String sector,
    required String cell,
    required String village,
    String? farmSize,
    String? primaryCrop,
  });

  Future<bool> isAuthenticated();
}
