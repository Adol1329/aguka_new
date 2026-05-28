import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/activities/data/models/farmer_crop_option_model.dart';
import 'package:aguka_mobile/features/activities/domain/entities/activity.dart';

abstract class ActivityRepository {
  Future<Either<Failure, List<Activity>>> getActivities();
  Future<Either<Failure, List<String>>> getActivityTypes();
  Future<Either<Failure, List<FarmerCropOptionModel>>> getFarmerCrops();
  Future<Either<Failure, Activity>> createActivity({
    required String activityType,
    required String description,
    required DateTime activityDate,
    String? cropId,
    Map<String, dynamic>? inputs,
  });
}
