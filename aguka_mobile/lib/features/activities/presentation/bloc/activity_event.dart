import 'package:equatable/equatable.dart';

abstract class ActivityEvent extends Equatable {
  const ActivityEvent();

  @override
  List<Object?> get props => [];
}

class FetchActivities extends ActivityEvent {}

class FetchActivityFormData extends ActivityEvent {}

class CreateActivityRequested extends ActivityEvent {
  final String activityType;
  final String description;
  final DateTime activityDate;
  final String? cropId;

  const CreateActivityRequested({
    required this.activityType,
    required this.description,
    required this.activityDate,
    this.cropId,
  });

  @override
  List<Object?> get props => [activityType, description, activityDate, cropId];
}
