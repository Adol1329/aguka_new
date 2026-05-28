import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';

abstract class TelemetryRepository {
  Stream<TelemetryEntity> get telemetryStream;
  Stream<bool> get connectionStream;
  
  void startSubscription();
  void stopSubscription();
  
  Future<TelemetryEntity> getLatestReading(String farmId);
}
