import 'package:aguka_mobile/core/network/dio_client.dart';
import 'package:aguka_mobile/data/datasources/remote/socket_client.dart';
import 'package:aguka_mobile/features/telemetry/data/models/telemetry_model.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';

abstract class TelemetryRemoteDataSource {
  Stream<TelemetryModel> get telemetryStream;
  Stream<bool> get connectionStream;

  void startSubscription();
  void stopSubscription();
  
  Future<TelemetryModel> getLatestReading(String farmId);
}

class TelemetryRemoteDataSourceImpl implements TelemetryRemoteDataSource {
  final SocketClient socketClient;
  final DioClient dioClient;

  TelemetryRemoteDataSourceImpl({
    required this.socketClient,
    required this.dioClient,
  });

  @override
  Stream<TelemetryModel> get telemetryStream => socketClient.telemetryStream
      .map((data) => TelemetryModel.fromJson(data));

  @override
  Stream<bool> get connectionStream => socketClient.connectionStream;

  @override
  void startSubscription() {
    socketClient.connect();
  }

  @override
  void stopSubscription() {
    socketClient.disconnect();
  }

  @override
  Future<TelemetryModel> getLatestReading(String farmId) async {
    try {
      final response = await dioClient.dio.get('/farmers/crops/simulate/$farmId');
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return TelemetryModel.fromJson(data);
      } else {
        throw ServerException();
      }
    } catch (e) {
      throw ServerException();
    }
  }
}
