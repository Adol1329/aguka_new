import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';

enum CooperativeStatus { initial, loading, loaded, error }
enum MembershipRequestStatus { idle, sending, sent, error }

class CooperativeState extends Equatable {
  final CooperativeStatus status;
  final CooperativeEntity? cooperative;
  final List<CooperativeMemberEntity> members;
  final List<JoinRequestEntity> joinRequests;
  final List<CooperativeActivityEntity> activities;
  final List<CooperativeResourceEntity> resources;
  final List<CooperativeListItemEntity> cooperativeList;
  final MembershipRequestStatus membershipRequestStatus;
  final String? errorMessage;

  const CooperativeState({
    this.status = CooperativeStatus.initial,
    this.cooperative,
    this.members = const [],
    this.joinRequests = const [],
    this.activities = const [],
    this.resources = const [],
    this.cooperativeList = const [],
    this.membershipRequestStatus = MembershipRequestStatus.idle,
    this.errorMessage,
  });

  CooperativeState copyWith({
    CooperativeStatus? status,
    CooperativeEntity? cooperative,
    List<CooperativeMemberEntity>? members,
    List<JoinRequestEntity>? joinRequests,
    List<CooperativeActivityEntity>? activities,
    List<CooperativeResourceEntity>? resources,
    List<CooperativeListItemEntity>? cooperativeList,
    MembershipRequestStatus? membershipRequestStatus,
    String? errorMessage,
  }) {
    return CooperativeState(
      status: status ?? this.status,
      cooperative: cooperative ?? this.cooperative,
      members: members ?? this.members,
      joinRequests: joinRequests ?? this.joinRequests,
      activities: activities ?? this.activities,
      resources: resources ?? this.resources,
      cooperativeList: cooperativeList ?? this.cooperativeList,
      membershipRequestStatus: membershipRequestStatus ?? this.membershipRequestStatus,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        status, cooperative, members, joinRequests, activities,
        resources, cooperativeList, membershipRequestStatus, errorMessage,
      ];
}
