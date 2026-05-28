import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/irrigation/domain/entities/irrigation_status.dart';

enum IrrigationStateStatus { initial, loading, loaded, error }

class IrrigationState extends Equatable {
  final IrrigationStateStatus status;
  final IrrigationStatus? data;
  final String? errorMessage;

  const IrrigationState({
    this.status = IrrigationStateStatus.initial,
    this.data,
    this.errorMessage,
  });

  IrrigationState copyWith({
    IrrigationStateStatus? status,
    IrrigationStatus? data,
    String? errorMessage,
  }) {
    return IrrigationState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, data, errorMessage];
}
