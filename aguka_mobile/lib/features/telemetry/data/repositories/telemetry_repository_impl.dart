import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';
import 'package:aguka_mobile/features/telemetry/domain/repositories/telemetry_repository.dart';
import '../datasources/telemetry_remote_data_source.dart';

class TelemetryRepositoryImpl implements TelemetryRepository {
  final TelemetryRemoteDataSource remoteDataSource;

  TelemetryRepositoryImpl({required this.remoteDataSource});

  @override
  Stream<TelemetryEntity> get telemetryStream => remoteDataSource.telemetryStream;

  @override
  Stream<bool> get connectionStream => remoteDataSource.connectionStream;

  @override
  void startSubscription() {
    remoteDataSource.startSubscription();
  }

  @override
  void stopSubscription() {
    remoteDataSource.stopSubscription();
  }

  @override
  Future<TelemetryEntity> getLatestReading(String farmId) async {
    // Note: In a full offline-first implementation, we'd check local DB first
    // using a LocalDataSource, and fallback to RemoteDataSource if needed.
    return await remoteDataSource.getLatestReading(farmId);
  }
}
