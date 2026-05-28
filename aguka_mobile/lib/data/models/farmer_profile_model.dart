import 'package:equatable/equatable.dart';

class FarmerProfileModel extends Equatable {
  final String id;
  final String userId;
  final String? cooperativeId;
  final String fullName;
  final String? farmName;
  final String location;
  final String district;
  final String sector;
  final String? cell;
  final String? village;
  final double? farmSizeHectares;
  final double? gpsLatitude;
  final double? gpsLongitude;
  final double? elevationMeters;
  final String? soilType;
  final String? waterSource;
  final String? irrigationType;
  final String preferredChannel;
  final String? literacyLevel;
  final String? profileImageUrl;
  final String? emergencyContact;
  final int familyMembers;

  const FarmerProfileModel({
    required this.id,
    required this.userId,
    this.cooperativeId,
    required this.fullName,
    this.farmName,
    required this.location,
    required this.district,
    required this.sector,
    this.cell,
    this.village,
    this.farmSizeHectares,
    this.gpsLatitude,
    this.gpsLongitude,
    this.elevationMeters,
    this.soilType,
    this.waterSource,
    this.irrigationType,
    this.preferredChannel = 'smartphone',
    this.literacyLevel,
    this.profileImageUrl,
    this.emergencyContact,
    this.familyMembers = 0,
  });

  factory FarmerProfileModel.fromJson(Map<String, dynamic> json) {
    return FarmerProfileModel(
      id: json['id'] ?? '',
      userId: json['user_id'] ?? json['userId'] ?? '',
      cooperativeId: json['cooperative_id'] ?? json['cooperativeId'],
      fullName: json['full_name'] ?? json['fullName'] ?? '',
      farmName: json['farm_name'] ?? json['farmName'],
      location: json['location'] ?? '',
      district: json['district'] ?? '',
      sector: json['sector'] ?? '',
      cell: json['cell'],
      village: json['village'],
      farmSizeHectares: (json['farm_size_hectares'] ?? json['farmSizeHectares'])?.toDouble(),
      gpsLatitude: (json['gps_latitude'] ?? json['gpsLatitude'])?.toDouble(),
      gpsLongitude: (json['gps_longitude'] ?? json['gpsLongitude'])?.toDouble(),
      elevationMeters: (json['elevation_meters'] ?? json['elevationMeters'])?.toDouble(),
      soilType: json['soil_type'] ?? json['soilType'],
      waterSource: json['water_source'] ?? json['waterSource'],
      irrigationType: json['irrigation_type'] ?? json['irrigationType'],
      preferredChannel: json['preferred_channel'] ?? json['preferredChannel'] ?? 'smartphone',
      literacyLevel: json['literacy_level'] ?? json['literacyLevel'],
      profileImageUrl: json['profile_image_url'] ?? json['profileImageUrl'],
      emergencyContact: json['emergency_contact'] ?? json['emergencyContact'],
      familyMembers: json['family_members'] ?? json['familyMembers'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'user_id': userId,
        'cooperative_id': cooperativeId,
        'full_name': fullName,
        'farm_name': farmName,
        'location': location,
        'district': district,
        'sector': sector,
        'cell': cell,
        'village': village,
        'farm_size_hectares': farmSizeHectares,
        'gps_latitude': gpsLatitude,
        'gps_longitude': gpsLongitude,
        'elevation_meters': elevationMeters,
        'soil_type': soilType,
        'water_source': waterSource,
        'irrigation_type': irrigationType,
        'preferred_channel': preferredChannel,
        'literacy_level': literacyLevel,
        'profile_image_url': profileImageUrl,
        'emergency_contact': emergencyContact,
        'family_members': familyMembers,
      };

  @override
  List<Object?> get props => [id, userId, fullName, district, sector];
}
