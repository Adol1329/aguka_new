import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/irrigation/domain/entities/irrigation_status.dart';

enum IrrigationStateStatus { initial, loading, loaded, error }

/// Tracks which request the current status transition belongs to, so the UI
/// can show a "pump started/stopped" toast only for toggle actions and not
/// for the initial status fetch.
enum IrrigationActionType { none, fetch, toggle }

class IrrigationState extends Equatable {
  final IrrigationStateStatus status;
  final IrrigationStatus? data;
  final String? errorMessage;
  final IrrigationActionType lastAction;

  const IrrigationState({
    this.status = IrrigationStateStatus.initial,
    this.data,
    this.errorMessage,
    this.lastAction = IrrigationActionType.none,
  });

  IrrigationState copyWith({
    IrrigationStateStatus? status,
    IrrigationStatus? data,
    String? errorMessage,
    IrrigationActionType? lastAction,
    bool clearError = false,
  }) {
    return IrrigationState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      lastAction: lastAction ?? this.lastAction,
    );
  }

  @override
  List<Object?> get props => [status, data, errorMessage, lastAction];
}
