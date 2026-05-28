import 'package:equatable/equatable.dart';

class CooperativeEntity extends Equatable {
  final String id;
  final String name;
  final String registrationNumber;
  final String? description;
  final int memberCount;

  const CooperativeEntity({
    required this.id,
    required this.name,
    required this.registrationNumber,
    this.description,
    this.memberCount = 0,
  });

  @override
  List<Object?> get props => [id, name, registrationNumber, description, memberCount];
}

class CooperativeMemberEntity extends Equatable {
  final String id;
  final String userId;
  final String fullName;
  final String phone;
  final String role;
  final String status;
  final DateTime joinedAt;

  const CooperativeMemberEntity({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.phone,
    required this.role,
    required this.status,
    required this.joinedAt,
  });

  @override
  List<Object?> get props => [id, userId, fullName, phone, role, status, joinedAt];
}
