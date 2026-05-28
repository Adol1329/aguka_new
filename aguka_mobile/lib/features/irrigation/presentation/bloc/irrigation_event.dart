import 'package:equatable/equatable.dart';

abstract class IrrigationEvent extends Equatable {
  const IrrigationEvent();

  @override
  List<Object?> get props => [];
}

class FetchIrrigationStatus extends IrrigationEvent {
  final String farmId;
  const FetchIrrigationStatus(this.farmId);

  @override
  List<Object?> get props => [farmId];
}

class TogglePump extends IrrigationEvent {
  final String farmId;
  final bool isActive;
  
  const TogglePump({required this.farmId, required this.isActive});

  @override
  List<Object?> get props => [farmId, isActive];
}
