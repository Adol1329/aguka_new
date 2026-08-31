import 'package:equatable/equatable.dart';

class FieldVisitEntity extends Equatable {
  final String id;
  final String farmerName;
  final String? farmName;
  final DateTime scheduledDate;
  final String? status;
  final String? notes;

  const FieldVisitEntity({
    required this.id,
    required this.farmerName,
    this.farmName,
    required this.scheduledDate,
    this.status,
    this.notes,
  });

  @override
  List<Object?> get props => [id, farmerName, farmName, scheduledDate, status, notes];
}
