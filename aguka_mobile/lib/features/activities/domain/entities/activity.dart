import 'package:equatable/equatable.dart';

class Activity extends Equatable {
  final String id;
  final String activityType;
  final String? category;
  final String? cropId;
  final double? quantity;
  final String? unit;
  final double? costRwf;
  final String? notes;
  final DateTime activityDate;
  final DateTime? createdAt;

  const Activity({
    required this.id,
    required this.activityType,
    this.category,
    this.cropId,
    this.quantity,
    this.unit,
    this.costRwf,
    this.notes,
    required this.activityDate,
    this.createdAt,
  });

  @override
  List<Object?> get props => [
        id,
        activityType,
        category,
        cropId,
        quantity,
        unit,
        costRwf,
        notes,
        activityDate,
        createdAt,
      ];
}
