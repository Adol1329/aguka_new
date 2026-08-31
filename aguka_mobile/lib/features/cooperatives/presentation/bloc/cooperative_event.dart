import 'package:equatable/equatable.dart';

abstract class CooperativeEvent extends Equatable {
  const CooperativeEvent();

  @override
  List<Object?> get props => [];
}

class FetchMyCooperative extends CooperativeEvent {}

class AddCooperativeMember extends CooperativeEvent {
  final String cooperativeId;
  final String phone;
  final String fullName;

  const AddCooperativeMember({
    required this.cooperativeId,
    required this.phone,
    required this.fullName,
  });

  @override
  List<Object?> get props => [cooperativeId, phone, fullName];
}

class FetchJoinRequests extends CooperativeEvent {
  final String cooperativeId;
  const FetchJoinRequests(this.cooperativeId);
  @override
  List<Object?> get props => [cooperativeId];
}

class ApproveJoinRequest extends CooperativeEvent {
  final String cooperativeId;
  final String requestId;
  const ApproveJoinRequest({required this.cooperativeId, required this.requestId});
  @override
  List<Object?> get props => [cooperativeId, requestId];
}

class RejectJoinRequest extends CooperativeEvent {
  final String cooperativeId;
  final String requestId;
  const RejectJoinRequest({required this.cooperativeId, required this.requestId});
  @override
  List<Object?> get props => [cooperativeId, requestId];
}

class FetchCooperativeActivities extends CooperativeEvent {
  final String cooperativeId;
  const FetchCooperativeActivities(this.cooperativeId);
  @override
  List<Object?> get props => [cooperativeId];
}

class FetchCooperativeResources extends CooperativeEvent {
  final String cooperativeId;
  const FetchCooperativeResources(this.cooperativeId);
  @override
  List<Object?> get props => [cooperativeId];
}

class FetchCooperativeList extends CooperativeEvent {}

class CreateCooperativeActivity extends CooperativeEvent {
  final String cooperativeId;
  final String title;
  final String activityType;
  final DateTime scheduledAt;
  final String? location;
  final String? description;
  final int? expectedParticipants;

  const CreateCooperativeActivity({
    required this.cooperativeId,
    required this.title,
    required this.activityType,
    required this.scheduledAt,
    this.location,
    this.description,
    this.expectedParticipants,
  });

  @override
  List<Object?> get props => [cooperativeId, title, activityType, scheduledAt];
}

class AddCooperativeResource extends CooperativeEvent {
  final String cooperativeId;
  final String name;
  final String resourceType;
  final String? category;
  final double? quantity;
  final String? unit;
  final String? location;
  final String? condition;

  const AddCooperativeResource({
    required this.cooperativeId,
    required this.name,
    required this.resourceType,
    this.category,
    this.quantity,
    this.unit,
    this.location,
    this.condition,
  });

  @override
  List<Object?> get props => [cooperativeId, name, resourceType];
}

class RequestMembership extends CooperativeEvent {
  final String cooperativeId;
  const RequestMembership(this.cooperativeId);
  @override
  List<Object?> get props => [cooperativeId];
}
