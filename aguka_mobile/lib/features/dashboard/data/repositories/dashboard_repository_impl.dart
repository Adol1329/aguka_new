import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/dashboard_summary.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/officer_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/cooperative_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/farmer_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/repositories/dashboard_repository.dart';
import '../datasources/dashboard_remote_data_source.dart';

class DashboardRepositoryImpl implements DashboardRepository {
  final DashboardRemoteDataSource remoteDataSource;

  DashboardRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, DashboardSummary>> getDashboardSummary(String farmId) async {
    try {
      final summary = await remoteDataSource.getDashboardSummary(farmId);
      return Right(summary);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, OfficerDashboardData>> getOfficerDashboard() async {
    try {
      final data = await remoteDataSource.getOfficerDashboard();
      return Right(data);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, CooperativeDashboardData>> getCooperativeDashboard(String cooperativeId) async {
    try {
      final data = await remoteDataSource.getCooperativeDashboard(cooperativeId);
      return Right(data);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, FarmerDashboardData>> getFarmerDashboard() async {
    try {
      final data = await remoteDataSource.getFarmerDashboard();
      return Right(data);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
