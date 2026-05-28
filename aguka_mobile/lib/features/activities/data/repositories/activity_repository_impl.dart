import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/activities/data/datasources/activity_remote_data_source.dart';
import 'package:aguka_mobile/features/activities/data/models/farmer_crop_option_model.dart';
import 'package:aguka_mobile/features/activities/domain/entities/activity.dart';
import 'package:aguka_mobile/features/activities/domain/repositories/activity_repository.dart';

class ActivityRepositoryImpl implements ActivityRepository {
  final ActivityRemoteDataSource remoteDataSource;

  ActivityRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<Activity>>> getActivities() async {
    try {
      return Right(await remoteDataSource.getActivities());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, List<String>>> getActivityTypes() async {
    try {
      return Right(await remoteDataSource.getActivityTypes());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, List<FarmerCropOptionModel>>> getFarmerCrops() async {
    try {
      return Right(await remoteDataSource.getFarmerCrops());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, Activity>> createActivity({
    required String activityType,
    required String description,
    required DateTime activityDate,
    String? cropId,
    Map<String, dynamic>? inputs,
  }) async {
    try {
      return Right(await remoteDataSource.createActivity(
        activityType: activityType,
        description: description,
        activityDate: activityDate,
        cropId: cropId,
        inputs: inputs,
      ));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }
}
