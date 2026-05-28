import 'package:aguka_mobile/features/telemetry/domain/repositories/telemetry_repository.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';

class SubscribeToTelemetryUseCase {
  final TelemetryRepository repository;

  SubscribeToTelemetryUseCase(this.repository);

  Stream<TelemetryEntity> get telemetryStream => repository.telemetryStream;
  Stream<bool> get connectionStream => repository.connectionStream;

  void call() {
    repository.startSubscription();
  }
}

class UnsubscribeFromTelemetryUseCase {
  final TelemetryRepository repository;

  UnsubscribeFromTelemetryUseCase(this.repository);

  void call() {
    repository.stopSubscription();
  }
}
