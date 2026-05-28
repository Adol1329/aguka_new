import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';

class CooperativeModel extends CooperativeEntity {
  const CooperativeModel({
    required super.id,
    required super.name,
    required super.registrationNumber,
    super.description,
    super.memberCount,
  });

  factory CooperativeModel.fromJson(Map<String, dynamic> json) {
    return CooperativeModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      registrationNumber: json['registrationNumber'] ?? '',
      description: json['description'],
      memberCount: json['_count']?['farmers'] ?? json['memberCount'] ?? 0,
    );
  }

  static CooperativeModel mock() {
    return const CooperativeModel(
      id: 'coop-001',
      name: 'Kigali Farmers Union',
      registrationNumber: 'RCA/2022/0042',
      description: 'A cooperative supporting smallholder farmers in Kigali.',
      memberCount: 34,
    );
  }
}

class CooperativeMemberModel extends CooperativeMemberEntity {
  const CooperativeMemberModel({
    required super.id,
    required super.userId,
    required super.fullName,
    required super.phone,
    required super.role,
    required super.status,
    required super.joinedAt,
  });

  factory CooperativeMemberModel.fromJson(Map<String, dynamic> json) {
    return CooperativeMemberModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      fullName: json['fullName'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'member',
      status: json['status'] ?? 'active',
      joinedAt: json['joinedAt'] != null
          ? DateTime.parse(json['joinedAt'])
          : DateTime.now(),
    );
  }

  static List<CooperativeMemberModel> mockList() {
    return [
      CooperativeMemberModel(
        id: 'm1', userId: 'u1', fullName: 'Amina Uwase',
        phone: '+250788000001', role: 'leader', status: 'active',
        joinedAt: DateTime(2023, 1, 15),
      ),
      CooperativeMemberModel(
        id: 'm2', userId: 'u2', fullName: 'Jean Claude Nkusi',
        phone: '+250788000002', role: 'member', status: 'active',
        joinedAt: DateTime(2023, 3, 10),
      ),
      CooperativeMemberModel(
        id: 'm3', userId: 'u3', fullName: 'Solange Ingabire',
        phone: '+250788000003', role: 'member', status: 'active',
        joinedAt: DateTime(2023, 6, 22),
      ),
    ];
  }
}
