import 'package:equatable/equatable.dart';

class RiskEntity extends Equatable {
  final String id;
  final String label;
  final String severity;
  final String? location;
  final String? description;
  final DateTime? detectedAt;

  const RiskEntity({
    required this.id,
    required this.label,
    required this.severity,
    this.location,
    this.description,
    this.detectedAt,
  });

  @override
  List<Object?> get props => [id, label, severity, location, description, detectedAt];
}
