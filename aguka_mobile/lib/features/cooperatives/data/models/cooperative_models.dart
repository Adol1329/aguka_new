class Cooperative {
  final String id;
  final String name;
  final String registrationNumber;
  final String? description;
  final int memberCount;

  Cooperative({
    required this.id,
    required this.name,
    required this.registrationNumber,
    this.description,
    this.memberCount = 0,
  });

  factory Cooperative.fromJson(Map<String, dynamic> json) {
    return Cooperative(
      id: json['id'],
      name: json['name'],
      registrationNumber: json['registrationNumber'],
      description: json['description'],
      memberCount: json['_count']?['farmers'] ?? 0,
    );
  }
}

class CooperativeMember {
  final String id;
  final String userId;
  final String fullName;
  final String phone;
  final String role;
  final String status;
  final DateTime joinedAt;

  CooperativeMember({
    required this.id,
    required this.userId,
    required this.fullName,
    required this.phone,
    required this.role,
    required this.status,
    required this.joinedAt,
  });

  factory CooperativeMember.fromJson(Map<String, dynamic> json) {
    return CooperativeMember(
      id: json['id'],
      userId: json['userId'],
      fullName: json['fullName'],
      phone: json['phone'],
      role: json['role'],
      status: json['status'],
      joinedAt: DateTime.parse(json['joinedAt']),
    );
  }
}
