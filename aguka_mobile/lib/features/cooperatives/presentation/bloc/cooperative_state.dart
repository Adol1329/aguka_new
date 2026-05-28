import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';

enum CooperativeStatus { initial, loading, loaded, error }

class CooperativeState extends Equatable {
  final CooperativeStatus status;
  final CooperativeEntity? cooperative;
  final List<CooperativeMemberEntity> members;
  final String? errorMessage;

  const CooperativeState({
    this.status = CooperativeStatus.initial,
    this.cooperative,
    this.members = const [],
    this.errorMessage,
  });

  CooperativeState copyWith({
    CooperativeStatus? status,
    CooperativeEntity? cooperative,
    List<CooperativeMemberEntity>? members,
    String? errorMessage,
  }) {
    return CooperativeState(
      status: status ?? this.status,
      cooperative: cooperative ?? this.cooperative,
      members: members ?? this.members,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, cooperative, members, errorMessage];
}
