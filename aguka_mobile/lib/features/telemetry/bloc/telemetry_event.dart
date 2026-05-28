import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';

abstract class TelemetryEvent extends Equatable {
  const TelemetryEvent();

  @override
  List<Object?> get props => [];
}

class StartTelemetrySubscription extends TelemetryEvent {}

class StopTelemetrySubscription extends TelemetryEvent {}

class FetchLatestTelemetry extends TelemetryEvent {
  final String farmId;
  const FetchLatestTelemetry(this.farmId);
  @override
  List<Object?> get props => [farmId];
}

class TelemetryDataReceived extends TelemetryEvent {
  final TelemetryEntity data;
  const TelemetryDataReceived(this.data);

  @override
  List<Object?> get props => [data];
}

class ConnectionStatusChanged extends TelemetryEvent {
  final bool isConnected;
  const ConnectionStatusChanged(this.isConnected);

  @override
  List<Object?> get props => [isConnected];
}
