import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/utils/preferences_helper.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';
import 'package:aguka_mobile/data/datasources/remote/socket_client.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final PreferencesHelper preferencesHelper;
  final SocketClient socketClient;

  AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.preferencesHelper,
    required this.socketClient,
  });

  @override
  Future<Either<Failure, UserEntity>> login({
    required String phone,
    required String password,
  }) async {
    try {
      final loginResponse = await remoteDataSource.login(
        phone: phone,
        password: password,
      );

      // Persist auth token, refresh token, user ID, and role for session continuity
      await preferencesHelper.setAuthToken(loginResponse.token);
      if (loginResponse.refreshToken != null) {
        await preferencesHelper.setRefreshToken(loginResponse.refreshToken!);
      }
      await preferencesHelper.setUserId(loginResponse.user.id);
      await preferencesHelper.setUserRole(loginResponse.user.role);
      
      // Connect socket with new token
      socketClient.connect(forceReconnect: true);
      
      return Right(loginResponse.user);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> register({
    required String phone,
    required String password,
    required String fullName,
    required String role,
    String? email,
    String? language,
  }) async {
    try {
      final loginResponse = await remoteDataSource.register(
        phone: phone,
        password: password,
        fullName: fullName,
        role: role,
        email: email,
        language: language,
      );
      // Save tokens so the user is auto-authenticated without re-login
      await preferencesHelper.setAuthToken(loginResponse.token);
      if (loginResponse.refreshToken != null) {
        await preferencesHelper.setRefreshToken(loginResponse.refreshToken!);
      }
      await preferencesHelper.setUserId(loginResponse.user.id);
      await preferencesHelper.setUserRole(loginResponse.user.role);
      socketClient.connect(forceReconnect: true);
      return Right(loginResponse.user);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> onboardFarmer(Map<String, dynamic> data) async {
    try {
      final userModel = await remoteDataSource.onboardFarmer(data);
      return Right(userModel);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> onboardOfficer(Map<String, dynamic> data) async {
    try {
      final userModel = await remoteDataSource.onboardOfficer(data);
      return Right(userModel);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> onboardCooperative(Map<String, dynamic> data) async {
    try {
      final userModel = await remoteDataSource.onboardCooperative(data);
      return Right(userModel);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> getCurrentUser() async {
    try {
      final userModel = await remoteDataSource.getCurrentUser();
      return Right(userModel);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> getProfile() async {
    try {
      final userModel = await remoteDataSource.getProfile();
      return Right(userModel);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserEntity>> updateProfile({
    required String firstName,
    required String lastName,
    required String district,
    required String sector,
    required String cell,
    required String village,
    String? farmSize,
    String? primaryCrop,
  }) async {
    try {
      final userModel = await remoteDataSource.updateProfile(
        firstName: firstName,
        lastName: lastName,
        district: district,
        sector: sector,
        cell: cell,
        village: village,
        farmSize: farmSize,
        primaryCrop: primaryCrop,
      );
      return Right(userModel);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      final token = preferencesHelper.authToken;
      if (token != null && token.isNotEmpty) {
        // We attempt a graceful logout, but we don't block on its failure
        await remoteDataSource.logout().catchError((_) {
            // Silently ignore logout errors (like 401) to ensure local clear happens
        });
      }
    } finally {
      // Always clear local session
      await preferencesHelper.clearAuth();
      socketClient.disconnect();
    }
    return const Right(null);
  }

  @override
  Future<bool> isAuthenticated() async {
    final token = preferencesHelper.authToken;
    return token != null && token.isNotEmpty;
  }

  @override
  Future<Either<Failure, void>> refreshToken() async {
    try {
      final storedRefreshToken = preferencesHelper.refreshToken;
      if (storedRefreshToken == null || storedRefreshToken.isEmpty) {
        return Left(ServerFailure('No refresh token available'));
      }
      final loginResponse = await remoteDataSource.refreshToken(storedRefreshToken);
      await preferencesHelper.setAuthToken(loginResponse.token);
      if (loginResponse.refreshToken != null) {
        await preferencesHelper.setRefreshToken(loginResponse.refreshToken!);
      }
      socketClient.connect(forceReconnect: true);
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      await remoteDataSource.changePassword(
        currentPassword: currentPassword,
        newPassword: newPassword,
      );
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, void>> clearLocalSession() async {
    try {
      await preferencesHelper.clearAuth();
      socketClient.disconnect();
      return const Right(null);
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
