import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/guidance/data/models/guidance_models.dart';

abstract class GuidanceRepository {
  Future<Either<Failure, List<CropModel>>> getCrops();
  Future<Either<Failure, CropGuidanceModel>> getCropGuidance(String farmerCropId);
  Future<Either<Failure, List<LivestockModel>>> getLivestock();
  Future<Either<Failure, LivestockGuidanceModel>> getLivestockGuidance(String livestockId);
}
