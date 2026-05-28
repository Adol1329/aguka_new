import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/activities/data/models/farmer_crop_option_model.dart';
import 'package:aguka_mobile/features/activities/domain/entities/activity.dart';

enum ActivityStatus { initial, loading, loaded, submitting, success, error }

class ActivityState extends Equatable {
  final ActivityStatus status;
  final List<Activity> activities;
  final List<String> activityTypes;
  final List<FarmerCropOptionModel> crops;
  final String? errorMessage;

  const ActivityState({
    this.status = ActivityStatus.initial,
    this.activities = const [],
    this.activityTypes = const [],
    this.crops = const [],
    this.errorMessage,
  });

  ActivityState copyWith({
    ActivityStatus? status,
    List<Activity>? activities,
    List<String>? activityTypes,
    List<FarmerCropOptionModel>? crops,
    String? errorMessage,
  }) {
    return ActivityState(
      status: status ?? this.status,
      activities: activities ?? this.activities,
      activityTypes: activityTypes ?? this.activityTypes,
      crops: crops ?? this.crops,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status,
        activities,
        activityTypes,
        crops,
        errorMessage,
      ];
}
