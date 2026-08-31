import 'package:aguka_mobile/features/cooperatives/domain/entities/cooperative_entity.dart';

class CooperativeModel extends CooperativeEntity {
  const CooperativeModel({
    required super.id,
    required super.name,
    required super.registrationNumber,
    super.description,
    super.memberCount,
    super.district,
    super.sector,
  });

  factory CooperativeModel.fromJson(Map<String, dynamic> json) {
    return CooperativeModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      registrationNumber: json['registrationNumber'] ?? '',
      description: json['description'],
      memberCount: json['_count']?['farmers'] ?? json['memberCount'] ?? 0,
      district: json['district'],
      sector: json['sector'],
    );
  }

  static CooperativeModel mock() {
    return const CooperativeModel(
      id: 'coop-001',
      name: 'Kigali Farmers Union',
      registrationNumber: 'RCA/2022/0042',
      description: 'A cooperative supporting smallholder farmers in Kigali.',
      memberCount: 34,
      district: 'Kigali',
      sector: 'Nyarugenge',
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

class JoinRequestModel extends JoinRequestEntity {
  const JoinRequestModel({
    required super.id,
    required super.userId,
    required super.fullName,
    required super.phone,
    required super.status,
    required super.requestedAt,
  });

  factory JoinRequestModel.fromJson(Map<String, dynamic> json) {
    return JoinRequestModel(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      fullName: json['fullName'] ?? '',
      phone: json['phone'] ?? '',
      status: json['status'] ?? 'pending',
      requestedAt: json['requestedAt'] != null
          ? DateTime.parse(json['requestedAt'])
          : DateTime.now(),
    );
  }

  static List<JoinRequestModel> mockList() {
    return [
      JoinRequestModel(
        id: 'jr1', userId: 'u10', fullName: 'Patrick Habimana',
        phone: '+250788100001', status: 'pending',
        requestedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      JoinRequestModel(
        id: 'jr2', userId: 'u11', fullName: 'Claire Mukamana',
        phone: '+250788100002', status: 'pending',
        requestedAt: DateTime.now().subtract(const Duration(days: 5)),
      ),
    ];
  }
}

class CooperativeActivityModel extends CooperativeActivityEntity {
  const CooperativeActivityModel({
    required super.id,
    required super.title,
    super.description,
    required super.activityType,
    required super.status,
    required super.scheduledAt,
    super.location,
    super.expectedParticipants,
  });

  factory CooperativeActivityModel.fromJson(Map<String, dynamic> json) {
    return CooperativeActivityModel(
      id: json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'],
      activityType: json['activityType'] ?? 'meeting',
      status: json['status'] ?? 'scheduled',
      scheduledAt: json['scheduledAt'] != null
          ? DateTime.parse(json['scheduledAt'])
          : DateTime.now().add(const Duration(days: 7)),
      location: json['location'],
      expectedParticipants: json['expectedParticipants'] ?? 0,
    );
  }

  static List<CooperativeActivityModel> mockList() {
    return [
      CooperativeActivityModel(
        id: 'act1', title: 'Monthly General Assembly',
        activityType: 'meeting', status: 'scheduled',
        scheduledAt: DateTime.now().add(const Duration(days: 5)),
        location: 'Cooperative Office, Kigali',
        expectedParticipants: 30,
      ),
      CooperativeActivityModel(
        id: 'act2', title: 'Fertilizer Application Training',
        activityType: 'training', status: 'scheduled',
        scheduledAt: DateTime.now().add(const Duration(days: 12)),
        location: 'Demo Farm, Sector Office',
        expectedParticipants: 20,
      ),
      CooperativeActivityModel(
        id: 'act3', title: 'Maize Harvest Coordination',
        activityType: 'harvest', status: 'scheduled',
        scheduledAt: DateTime.now().add(const Duration(days: 20)),
        location: 'Fields, Northern Zone',
        expectedParticipants: 50,
      ),
    ];
  }
}

class CooperativeResourceModel extends CooperativeResourceEntity {
  const CooperativeResourceModel({
    required super.id,
    required super.name,
    super.description,
    required super.resourceType,
    required super.status,
    super.availableQuantity,
    super.unit,
    super.category,
  });

  factory CooperativeResourceModel.fromJson(Map<String, dynamic> json) {
    return CooperativeResourceModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      resourceType: json['resourceType'] ?? 'inputs',
      status: json['status'] ?? 'available',
      availableQuantity: double.tryParse(
            json['availableQuantity']?.toString() ?? '0') ?? 0,
      unit: json['unit'],
      category: json['category'],
    );
  }

  static List<CooperativeResourceModel> mockList() {
    return [
      const CooperativeResourceModel(
        id: 'res1', name: 'NPK Fertilizer 17-17-17',
        resourceType: 'inputs', status: 'available',
        availableQuantity: 500, unit: 'kg', category: 'Fertilizer',
      ),
      const CooperativeResourceModel(
        id: 'res2', name: 'Maize Seeds (H614D)',
        resourceType: 'inputs', status: 'available',
        availableQuantity: 200, unit: 'kg', category: 'Seeds',
      ),
      const CooperativeResourceModel(
        id: 'res3', name: 'Irrigation Pump',
        resourceType: 'equipment', status: 'available',
        availableQuantity: 2, unit: 'units', category: 'Equipment',
      ),
      const CooperativeResourceModel(
        id: 'res4', name: 'Pesticide (Karate 2.5 EC)',
        resourceType: 'inputs', status: 'low_stock',
        availableQuantity: 15, unit: 'liters', category: 'Pesticide',
      ),
    ];
  }
}

class CooperativeListItemModel extends CooperativeListItemEntity {
  const CooperativeListItemModel({
    required super.id,
    required super.name,
    required super.registrationNumber,
    required super.district,
    required super.sector,
    super.memberCount,
    super.description,
  });

  factory CooperativeListItemModel.fromJson(Map<String, dynamic> json) {
    return CooperativeListItemModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      registrationNumber: json['registrationNumber'] ?? '',
      district: json['district'] ?? '',
      sector: json['sector'] ?? '',
      memberCount: json['_count']?['farmers'] ?? json['memberCount'] ?? 0,
      description: json['description'],
    );
  }

  static List<CooperativeListItemModel> mockList() {
    return const [
      CooperativeListItemModel(
        id: 'c1', name: 'Kigali Farmers Union', registrationNumber: 'RCA/2022/0042',
        district: 'Kigali', sector: 'Nyarugenge', memberCount: 34,
        description: 'Supporting smallholder farmers in Kigali.',
      ),
      CooperativeListItemModel(
        id: 'c2', name: 'Northern Grain Cooperative', registrationNumber: 'RCA/2021/0017',
        district: 'Musanze', sector: 'Muhoza', memberCount: 56,
        description: 'Promoting grain production in Northern Province.',
      ),
      CooperativeListItemModel(
        id: 'c3', name: 'Eastern Horticulture Coop', registrationNumber: 'RCA/2023/0088',
        district: 'Rwamagana', sector: 'Munyaga', memberCount: 28,
        description: 'Horticulture and vegetable production cooperative.',
      ),
    ];
  }
}
