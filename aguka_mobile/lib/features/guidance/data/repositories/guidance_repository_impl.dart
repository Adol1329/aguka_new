import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/guidance/data/datasources/guidance_remote_data_source.dart';
import 'package:aguka_mobile/features/guidance/data/models/guidance_models.dart';
import 'package:aguka_mobile/features/guidance/domain/repositories/guidance_repository.dart';

class GuidanceRepositoryImpl implements GuidanceRepository {
  final GuidanceRemoteDataSource remoteDataSource;

  GuidanceRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Either<Failure, List<CropModel>>> getCrops() async {
    try {
      return Right(await remoteDataSource.getCrops());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, CropGuidanceModel>> getCropGuidance(String farmerCropId) async {
    try {
      return Right(await remoteDataSource.getCropGuidance(farmerCropId));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, List<LivestockModel>>> getLivestock() async {
    try {
      return Right(await remoteDataSource.getLivestock());
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, LivestockGuidanceModel>> getLivestockGuidance(String livestockId) async {
    try {
      return Right(await remoteDataSource.getLivestockGuidance(livestockId));
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }
}
