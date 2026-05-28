import 'package:equatable/equatable.dart';

class CropModel extends Equatable {
  final String id;
  final String cropId;
  final String name;
  final String? status;
  final DateTime? plantedDate;
  final DateTime? expectedHarvestDate;

  const CropModel({
    required this.id,
    required this.cropId,
    required this.name,
    this.status,
    this.plantedDate,
    this.expectedHarvestDate,
  });

  factory CropModel.fromJson(Map<String, dynamic> json) {
    final crop = json['crop'] is Map<String, dynamic>
        ? json['crop'] as Map<String, dynamic>
        : <String, dynamic>{};
    return CropModel(
      id: json['id']?.toString() ?? '',
      cropId: json['cropId']?.toString() ?? crop['id']?.toString() ?? '',
      name: crop['nameEn']?.toString() ??
          crop['nameRw']?.toString() ??
          crop['nameFr']?.toString() ??
          '',
      status: json['status']?.toString(),
      plantedDate: _nullableDate(json['plantedDate']),
      expectedHarvestDate: _nullableDate(json['expectedHarvestDate']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'cropId': cropId,
        'name': name,
        'status': status,
        'plantedDate': plantedDate?.toIso8601String(),
        'expectedHarvestDate': expectedHarvestDate?.toIso8601String(),
      };

  @override
  List<Object?> get props => [id, cropId, name, status, plantedDate, expectedHarvestDate];
}

class CropGuidanceModel extends Equatable {
  final String cropName;
  final Map<String, dynamic> fields;

  const CropGuidanceModel({required this.cropName, required this.fields});

  factory CropGuidanceModel.fromJson(Map<String, dynamic> json) {
    final crop = json['crop'] is Map<String, dynamic>
        ? json['crop'] as Map<String, dynamic>
        : <String, dynamic>{};
    return CropGuidanceModel(
      cropName: crop['nameEn']?.toString() ??
          crop['nameRw']?.toString() ??
          crop['nameFr']?.toString() ??
          '',
      fields: Map<String, dynamic>.from(json)..remove('crop'),
    );
  }

  @override
  List<Object?> get props => [cropName, fields];
}

class LivestockModel extends Equatable {
  final String id;
  final String animalType;
  final String? breed;
  final String? tagNumber;
  final double? weightKg;
  final String healthStatus;
  final DateTime? lastVaccinationDate;
  final DateTime? nextVaccinationDue;

  const LivestockModel({
    required this.id,
    required this.animalType,
    this.breed,
    this.tagNumber,
    this.weightKg,
    required this.healthStatus,
    this.lastVaccinationDate,
    this.nextVaccinationDue,
  });

  factory LivestockModel.fromJson(Map<String, dynamic> json) {
    return LivestockModel(
      id: json['id']?.toString() ?? '',
      animalType: json['animalType']?.toString() ?? '',
      breed: json['breed']?.toString(),
      tagNumber: json['tagNumber']?.toString(),
      weightKg: _nullableDouble(json['weightKg']),
      healthStatus: json['healthStatus']?.toString() ?? '',
      lastVaccinationDate: _nullableDate(json['lastVaccinationDate']),
      nextVaccinationDue: _nullableDate(json['nextVaccinationDue']),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'animalType': animalType,
        'breed': breed,
        'tagNumber': tagNumber,
        'weightKg': weightKg,
        'healthStatus': healthStatus,
        'lastVaccinationDate': lastVaccinationDate?.toIso8601String(),
        'nextVaccinationDue': nextVaccinationDue?.toIso8601String(),
      };

  @override
  List<Object?> get props => [
        id,
        animalType,
        breed,
        tagNumber,
        weightKg,
        healthStatus,
        lastVaccinationDate,
        nextVaccinationDue,
      ];
}

class LivestockGuidanceModel extends Equatable {
  final LivestockModel livestock;
  final Map<String, dynamic> fields;

  const LivestockGuidanceModel({required this.livestock, required this.fields});

  factory LivestockGuidanceModel.fromJson(Map<String, dynamic> json) {
    final livestockJson = json['livestock'] is Map<String, dynamic>
        ? json['livestock'] as Map<String, dynamic>
        : <String, dynamic>{};
    return LivestockGuidanceModel(
      livestock: LivestockModel.fromJson(livestockJson),
      fields: Map<String, dynamic>.from(json)..remove('livestock'),
    );
  }

  @override
  List<Object?> get props => [livestock, fields];
}

DateTime? _nullableDate(dynamic value) {
  if (value == null) return null;
  return DateTime.tryParse(value.toString());
}

double? _nullableDouble(dynamic value) {
  if (value == null) return null;
  if (value is num) return value.toDouble();
  return double.tryParse(value.toString());
}
