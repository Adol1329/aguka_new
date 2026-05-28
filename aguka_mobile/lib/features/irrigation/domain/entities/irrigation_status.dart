import 'package:equatable/equatable.dart';

class IrrigationStatus extends Equatable {
  final bool isPumpActive;
  final DateTime? lastTapTime;
  final double waterUsed;
  final double percentageSaved;

  const IrrigationStatus({
    required this.isPumpActive,
    this.lastTapTime,
    required this.waterUsed,
    required this.percentageSaved,
  });

  @override
  List<Object?> get props => [isPumpActive, lastTapTime, waterUsed, percentageSaved];
}
