class FarmerCropOptionModel {
  final String id;
  final String name;
  final String? status;
  final DateTime? plantedDate;

  FarmerCropOptionModel({
    required this.id,
    required this.name,
    this.status,
    this.plantedDate,
  });

  factory FarmerCropOptionModel.fromJson(Map<String, dynamic> json) {
    final crop = json['crop'] is Map<String, dynamic>
        ? json['crop'] as Map<String, dynamic>
        : <String, dynamic>{};
    return FarmerCropOptionModel(
      id: json['id']?.toString() ?? '',
      name: crop['nameEn']?.toString() ??
          crop['nameRw']?.toString() ??
          crop['nameFr']?.toString() ??
          '',
      status: json['status']?.toString(),
      plantedDate: json['plantedDate'] == null
          ? null
          : DateTime.parse(json['plantedDate'].toString()),
    );
  }
}
