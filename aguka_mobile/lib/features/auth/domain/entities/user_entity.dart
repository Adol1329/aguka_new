import 'package:equatable/equatable.dart';

class UserEntity extends Equatable {
  final String id;
  final String phone;
  final String? email;
  final String? fullName;
  final String role;
  final String language;
  final bool isActive;
  final String? province;
  final String? district;
  final String? sector;
  final String? cell;
  final String? village;
  final String? cooperativeId;
  
  // Farmer only
  final double? farmSize;
  final List<String>? crops;
  
  // Extension Officer only
  final String? employeeId;
  final String? organization;
  final List<String>? coveredSectors;
  final List<String>? specializations;
  final String? badgePhotoUrl;
  
  // Cooperative Manager only
  final String? cooperativeName;
  final String? registrationNumber;
  final String? cooperativeType;
  final int? memberCount;
  final String? certificateUrl;
  
  final bool isOnboarded;
  final bool isApproved;
  final DateTime? createdAt;

  const UserEntity({
    required this.id,
    required this.phone,
    this.email,
    this.fullName,
    required this.role,
    required this.language,
    required this.isActive,
    this.isOnboarded = false,
    this.cooperativeId,
    this.province,
    this.district,
    this.sector,
    this.cell,
    this.village,
    this.farmSize,
    this.crops,
    this.employeeId,
    this.organization,
    this.coveredSectors,
    this.specializations,
    this.badgePhotoUrl,
    this.cooperativeName,
    this.registrationNumber,
    this.cooperativeType,
    this.memberCount,
    this.certificateUrl,
    this.isApproved = true,
    this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        phone,
        email,
        fullName,
        role,
        language,
        isActive,
        isOnboarded,
        cooperativeId,
        province,
        district,
        sector,
        cell,
        village,
        farmSize,
        crops,
        employeeId,
        organization,
        coveredSectors,
        specializations,
        badgePhotoUrl,
        cooperativeName,
        registrationNumber,
        cooperativeType,
        memberCount,
        certificateUrl,
        isApproved,
        createdAt,
      ];
}
