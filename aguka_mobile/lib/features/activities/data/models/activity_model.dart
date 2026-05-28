import 'package:aguka_mobile/features/activities/domain/entities/activity.dart';

class ActivityModel extends Activity {
  const ActivityModel({
    required super.id,
    required super.activityType,
    super.category,
    super.cropId,
    super.quantity,
    super.unit,
    super.costRwf,
    super.notes,
    required super.activityDate,
    super.createdAt,
  });

  factory ActivityModel.fromJson(Map<String, dynamic> json) {
    return ActivityModel(
      id: json['id']?.toString() ?? '',
      activityType: json['activityType']?.toString() ?? '',
      category: json['category']?.toString(),
      cropId: json['cropId']?.toString(),
      quantity: _toDouble(json['quantity']),
      unit: json['unit']?.toString(),
      costRwf: _toDouble(json['costRwf']),
      notes: json['notes']?.toString() ?? json['description']?.toString(),
      activityDate: _toDate(json['activityDate']),
      createdAt: json['createdAt'] == null ? null : _toDate(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'activityType': activityType,
      'category': category,
      'cropId': cropId,
      'quantity': quantity,
      'unit': unit,
      'costRwf': costRwf,
      'notes': notes,
      'activityDate': activityDate.toIso8601String(),
      'createdAt': createdAt?.toIso8601String(),
    };
  }

  static double? _toDouble(dynamic value) {
    if (value == null) return null;
    if (value is num) return value.toDouble();
    return double.tryParse(value.toString());
  }

  static DateTime _toDate(dynamic value) {
    if (value == null) return DateTime.fromMillisecondsSinceEpoch(0);
    return DateTime.parse(value.toString());
  }
}
