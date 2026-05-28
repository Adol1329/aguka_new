import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';

class DashboardSummary extends Equatable {
  final TelemetryEntity telemetry;
  final String source;
  final bool isCritical;

  const DashboardSummary({
    required this.telemetry,
    required this.source,
    required this.isCritical,
  });

  @override
  List<Object?> get props => [telemetry, source, isCritical];
}
