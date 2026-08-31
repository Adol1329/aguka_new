import 'package:equatable/equatable.dart';

class CooperativeEntity extends Equatable {
  final String id;
  final String name;
  final String registrationNumber;
  final String? description;
  final int memberCount;
  final String? district;
  final String? sector;

  const CooperativeEntity({
    required this.id,
    required this.name,
    required this.registrationNumber,
    this.description,
    this.memberCount = 0,
    this.district,
    this.sector,
  });

  @override
  List<Object?> get props => [id, name, registrationNumber, description, memberCount, district, sector];
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

class JoinRequestEntity extends Equatable {
  final String id;
  final String userId;
  final String fullName;
  final String phone;
  final String status;
  final DateTime requestedAt;

  const JoinRequestEntity({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.phone,
    required this.status,
    required this.requestedAt,
  });

  @override
  List<Object?> get props => [id, userId, fullName, phone, status, requestedAt];
}

class CooperativeActivityEntity extends Equatable {
  final String id;
  final String title;
  final String? description;
  final String activityType;
  final String status;
  final DateTime scheduledAt;
  final String? location;
  final int expectedParticipants;

  const CooperativeActivityEntity({
    required this.id,
    required this.title,
    this.description,
    required this.activityType,
    required this.status,
    required this.scheduledAt,
    this.location,
    this.expectedParticipants = 0,
  });

  @override
  List<Object?> get props => [id, title, activityType, status, scheduledAt];
}

class CooperativeResourceEntity extends Equatable {
  final String id;
  final String name;
  final String? description;
  final String resourceType;
  final String status;
  final double availableQuantity;
  final String? unit;
  final String? category;

  const CooperativeResourceEntity({
    required this.id,
    required this.name,
    this.description,
    required this.resourceType,
    required this.status,
    this.availableQuantity = 0,
    this.unit,
    this.category,
  });

  @override
  List<Object?> get props => [id, name, resourceType, status, availableQuantity];
}

class CooperativeListItemEntity extends Equatable {
  final String id;
  final String name;
  final String registrationNumber;
  final String district;
  final String sector;
  final int memberCount;
  final String? description;

  const CooperativeListItemEntity({
    required this.id,
    required this.name,
    required this.registrationNumber,
    required this.district,
    required this.sector,
    this.memberCount = 0,
    this.description,
  });

  @override
  List<Object?> get props => [id, name, registrationNumber, district, sector, memberCount];
}
