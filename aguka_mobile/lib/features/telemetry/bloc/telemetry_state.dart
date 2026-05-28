import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';

enum TelemetryStatus { initial, connecting, connected, disconnected, error }

class TelemetryState extends Equatable {
  final TelemetryStatus status;
  final TelemetryEntity? latestData;
  final String? errorMessage;
  final bool isConnected;

  const TelemetryState({
    this.status = TelemetryStatus.initial,
    this.latestData,
    this.errorMessage,
    this.isConnected = false,
  });

  TelemetryState copyWith({
    TelemetryStatus? status,
    TelemetryEntity? latestData,
    String? errorMessage,
    bool? isConnected,
  }) {
    return TelemetryState(
      status: status ?? this.status,
      latestData: latestData ?? this.latestData,
      errorMessage: errorMessage ?? this.errorMessage,
      isConnected: isConnected ?? this.isConnected,
    );
  }

  @override
  List<Object?> get props => [status, latestData, errorMessage, isConnected];
}
