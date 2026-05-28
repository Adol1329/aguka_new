import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/dashboard_summary.dart';
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
}
