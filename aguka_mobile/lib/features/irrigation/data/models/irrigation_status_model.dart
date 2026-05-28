import 'package:aguka_mobile/features/irrigation/domain/entities/irrigation_status.dart';

class IrrigationStatusModel extends IrrigationStatus {
  const IrrigationStatusModel({
    required super.isPumpActive,
    super.lastTapTime,
    required super.waterUsed,
    required super.percentageSaved,
  });

  factory IrrigationStatusModel.fromJson(Map<String, dynamic> json) {
    return IrrigationStatusModel(
      isPumpActive: json['isPumpActive'] ?? false,
      lastTapTime: json['lastTapTime'] != null ? DateTime.parse(json['lastTapTime']) : null,
      waterUsed: (json['waterUsed'] ?? 0.0).toDouble(),
      percentageSaved: (json['percentageSaved'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'isPumpActive': isPumpActive,
      'lastTapTime': lastTapTime?.toIso8601String(),
      'waterUsed': waterUsed,
      'percentageSaved': percentageSaved,
    };
  }
}
