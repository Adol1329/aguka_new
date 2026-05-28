import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';

class UserModel extends UserEntity {
  const UserModel({
    required super.id,
    required super.phone,
    super.email,
    super.fullName,
    required super.role,
    required super.language,
    required super.isActive,
    super.isOnboarded = false,
    super.cooperativeId,
    super.province,
    super.district,
    super.sector,
    super.cell,
    super.village,
    super.farmSize,
    super.crops,
    super.employeeId,
    super.organization,
    super.coveredSectors,
    super.specializations,
    super.badgePhotoUrl,
    super.cooperativeName,
    super.registrationNumber,
    super.cooperativeType,
    super.memberCount,
    super.certificateUrl,
    super.isApproved = true,
    super.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final farmer = json['farmerProfile'];
    final officer = json['officerProfile'];
    final manager = json['cooperativeProfile'];

    return UserModel(
      id: json['id'] ?? '',
      phone: json['phone'] ?? '',
      email: json['email'],
      fullName: json['fullName'],
      role: json['role'] ?? 'farmer',
      language: json['language'] ?? 'en',
      isActive: json['isActive'] ?? true,
      isOnboarded: json['isOnboarded'] ?? false,
      cooperativeId: json['cooperativeId'],
      province: json['province'],
      district: json['district'],
      sector: json['sector'],
      cell: json['cell'],
      village: json['village'],
      // Farmer Profile
      farmSize: farmer != null ? double.tryParse(farmer['farmSizeHectares'].toString()) : null,
      crops: farmer != null && farmer['crops'] != null ? List<String>.from(farmer['crops']) : null,
      // Officer Profile
      employeeId: officer != null ? officer['employeeId'] : null,
      organization: officer != null ? officer['organization'] : null,
      coveredSectors: officer != null && officer['coveredSectors'] != null ? List<String>.from(officer['coveredSectors']) : null,
      specializations: officer != null && officer['specializations'] != null ? List<String>.from(officer['specializations']) : null,
      badgePhotoUrl: officer != null ? officer['badgePhotoUrl'] : null,
      // Manager Profile
      cooperativeName: manager != null ? manager['cooperativeName'] : null,
      registrationNumber: manager != null ? manager['registrationNumber'] : null,
      cooperativeType: manager != null ? manager['cooperativeType'] : null,
      memberCount: manager != null && manager['memberCount'] != null ? int.tryParse(manager['memberCount'].toString()) : null,
      certificateUrl: manager != null ? manager['certificateUrl'] : null,
      
      isApproved: json['isApproved'] ?? true,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'phone': phone,
      'email': email,
      'fullName': fullName,
      'role': role,
      'language': language,
      'isActive': isActive,
      'isOnboarded': isOnboarded,
      'cooperativeId': cooperativeId,
      'province': province,
      'district': district,
      'sector': sector,
      'cell': cell,
      'village': village,
      'farmSize': farmSize,
      'crops': crops,
      'employeeId': employeeId,
      'organization': organization,
      'coveredSectors': coveredSectors,
      'specializations': specializations,
      'badgePhotoUrl': badgePhotoUrl,
      'cooperativeName': cooperativeName,
      'registrationNumber': registrationNumber,
      'cooperativeType': cooperativeType,
      'memberCount': memberCount,
      'certificateUrl': certificateUrl,
      'isApproved': isApproved,
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  static UserModel fromEntity(UserEntity entity) {
    return UserModel(
      id: entity.id,
      phone: entity.phone,
      email: entity.email,
      fullName: entity.fullName,
      role: entity.role,
      language: entity.language,
      isActive: entity.isActive,
      isOnboarded: entity.isOnboarded,
      cooperativeId: entity.cooperativeId,
      province: entity.province,
      district: entity.district,
      sector: entity.sector,
      cell: entity.cell,
      village: entity.village,
      farmSize: entity.farmSize,
      crops: entity.crops,
      employeeId: entity.employeeId,
      organization: entity.organization,
      coveredSectors: entity.coveredSectors,
      specializations: entity.specializations,
      badgePhotoUrl: entity.badgePhotoUrl,
      cooperativeName: entity.cooperativeName,
      registrationNumber: entity.registrationNumber,
      cooperativeType: entity.cooperativeType,
      memberCount: entity.memberCount,
      certificateUrl: entity.certificateUrl,
      isApproved: entity.isApproved,
      createdAt: entity.createdAt,
    );
  }
}
