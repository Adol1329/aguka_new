import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/foundation.dart';
import 'database_helper.dart';

class SyncService {
  final Dio dio;
  final DatabaseHelper dbHelper = DatabaseHelper.instance;

  SyncService(this.dio);

  /// Enhanced full sync with real-time capabilities
  Future<SyncResult> runFullSync(String farmId, {bool forceSync = false}) async {
    final stopwatch = Stopwatch()..start();
    
    try {
      // Check network connectivity
      final connectivityResult = await Connectivity().checkConnectivity();
      if (connectivityResult == ConnectivityResult.none) {
        return SyncResult(
          success: false,
          error: 'No internet connection',
          duration: stopwatch.elapsed,
        );
      }

      debugPrint('🚀 Starting enhanced full sync...');
      
      // Get last sync timestamp to avoid unnecessary data transfer
      final lastSync = await dbHelper.getLastSyncTimestamp();
      final syncSince = forceSync ? null : lastSync;

      // Sequential sync is smoother on low-end hardware (avoids CPU bursts during JSON parsing)
      await _pushPendingMutations();
      final soilCount = await _pullSoilReadings(farmId, syncSince);
      final weatherCount = await _pullWeatherData(farmId, syncSince);
      final marketCount = await _pullMarketPrices(syncSince);
      final irrigationCount = await _pullIrrigationData(farmId, syncSince);
      final notifCount = await _pullNotifications(farmId, syncSince);

      final totalSynced = soilCount + weatherCount + marketCount + irrigationCount + notifCount;

      // Update last sync timestamp
      await dbHelper.updateLastSyncTimestamp(DateTime.now());
      
      stopwatch.stop();
      
      if (kDebugMode) {
        debugPrint('✅ Sync complete in ${stopwatch.elapsedMilliseconds}ms — $totalSynced records synced');
      }
      
      return SyncResult(
        success: true,
        duration: stopwatch.elapsed,
        recordsSynced: totalSynced,
        lastSyncTimestamp: DateTime.now(),
      );
    } catch (e, stackTrace) {
      stopwatch.stop();
      if (kDebugMode) {
        debugPrint('❌ Sync failed: $e');
        debugPrint('Stack trace: $stackTrace');
      }
      
      return SyncResult(
        success: false,
        error: e.toString(),
        duration: stopwatch.elapsed,
      );
    }
  }

  /// Real-time sync for specific data types
  Future<void> syncSoilDataRealtime(String farmId) async {
    try {
      final response = await dio.get('/soil/latest', queryParameters: {
        'farmId': farmId,
        'limit': 10,
      });

      if (response.statusCode == 200) {
        final data = response.data['data'] as List;
        await dbHelper.insertSoilReadings(_formatSoilData(data, farmId));
        if (kDebugMode) debugPrint('📊 Real-time soil data synced: ${data.length} records');
      }
    } catch (e) {
      if (kDebugMode) debugPrint('⚠️ Real-time soil sync failed: $e');
    }
  }

  /// Enhanced pending mutations with conflict resolution
  Future<void> _pushPendingMutations() async {
    final pendingItems = await dbHelper.getPendingSyncs();
    if (pendingItems.isEmpty) {
      if (kDebugMode) debugPrint('📝 No pending mutations to sync');
      return;
    }

    if (kDebugMode) debugPrint('🔄 Found ${pendingItems.length} pending mutations to sync');

    int successCount = 0;
    int failureCount = 0;

    for (var item in pendingItems) {
      try {
        final result = await _syncMutationItem(item);
        if (result.success) {
          successCount++;
          await dbHelper.removeSyncItem(item['id'] as int);
          if (kDebugMode) debugPrint('✅ Successfully synced item ${item['id']}');
        } else if (result.error?.contains('403') == true) {
          // Self-healing: Remove items the server explicitly forbids (permissions/legacy)
          failureCount++;
          await dbHelper.removeSyncItem(item['id'] as int);
          if (kDebugMode) debugPrint('🛡️ Auto-removed forbidden item ${item['id']}');
        } else {
          failureCount++;
          await dbHelper.incrementRetryCount(item['id'] as int);
          if (kDebugMode) debugPrint('❌ Failed to sync item ${item['id']}: ${result.error}');
        }
      } catch (e) {
        failureCount++;
        await dbHelper.incrementRetryCount(item['id'] as int);
        if (kDebugMode) debugPrint('💥 Error syncing item ${item['id']}: $e');
      }
    }

    if (kDebugMode) debugPrint('📊 Sync results: $successCount success, $failureCount failures');
  }

  Future<SyncItemResult> _syncMutationItem(Map<String, dynamic> item) async {
    final operation = item['operation'] as String;
    final endpoint = item['endpoint'] as String;
    final payloadStr = item['payload'] as String;
    final payload = jsonDecode(payloadStr);

    try {
      Response response;

      switch (operation) {
        case 'POST':
          response = await dio.post(endpoint, data: payload);
          break;
        case 'PATCH':
          response = await dio.patch(endpoint, data: payload);
          break;
        case 'PUT':
          response = await dio.put(endpoint, data: payload);
          break;
        case 'DELETE':
          response = await dio.delete(endpoint);
          break;
        default:
          throw Exception('Unknown operation $operation');
      }

      if (response.statusCode != null && response.statusCode! >= 200 && response.statusCode! < 300) {
        return SyncItemResult(success: true);
      } else {
        return SyncItemResult(
          success: false,
          error: 'HTTP ${response.statusCode}: ${response.statusMessage}',
        );
      }
    } on DioException catch (e) {
      return SyncItemResult(
        success: false,
        error: 'Network error: ${e.message}',
      );
    } catch (e) {
      return SyncItemResult(
        success: false,
        error: 'Unexpected error: $e',
      );
    }
  }

  /// Enhanced soil data pull with delta sync
  Future<int> _pullSoilReadings(String farmId, DateTime? since) async {
    try {
      final queryParams = <String, dynamic>{'farmId': farmId};
      if (since != null) queryParams['since'] = since.toIso8601String();

      final response = await dio.get('/soil/readings', queryParameters: queryParams);
      if (response.statusCode == 200) {
        final List<dynamic> rawData = response.data['data'] ?? [];
        final formattedData = _formatSoilData(rawData, farmId);
        if (formattedData.isNotEmpty) {
          await dbHelper.insertSoilReadings(formattedData);
          if (kDebugMode) debugPrint('📊 Pulled ${formattedData.length} soil readings');
        }
        return formattedData.length;
      }
    } catch (e) {
      if (kDebugMode) debugPrint('⚠️ Failed to pull soil readings: $e');
    }
    return 0;
  }

  /// Pull weather data
  Future<int> _pullWeatherData(String farmId, DateTime? since) async {
    try {
      final queryParams = <String, dynamic>{'farmId': farmId};
      if (since != null) queryParams['since'] = since.toIso8601String();

      final response = await dio.get('/weather/current', queryParameters: queryParams);
      if (response.statusCode == 200) {
        final weatherData = response.data['data'];
        await dbHelper.insertWeatherData([{
          'farm_id': farmId,
          'temp_celsius': (weatherData['temperatureCelsius'] ?? 0.0).toDouble(),
          'humidity': (weatherData['humidityPercent'] ?? 0.0).toDouble(),
          'rainfall': (weatherData['rainfallMm'] ?? 0.0).toDouble(),
          'wind_speed': (weatherData['windSpeedKmh'] ?? 0.0).toDouble(),
          'reading_at': weatherData['readingAt'] ?? DateTime.now().toIso8601String(),
          'is_synced': 1,
        }]);
        if (kDebugMode) debugPrint('🌤️ Pulled weather data');
        return 1;
      }
    } catch (e) {
      if (kDebugMode) debugPrint('⚠️ Failed to pull weather data: $e');
    }
    return 0;
  }

  /// Pull market prices
  Future<int> _pullMarketPrices(DateTime? since) async {
    try {
      final queryParams = <String, dynamic>{};
      if (since != null) queryParams['since'] = since.toIso8601String();

      final response = await dio.get('/market/prices', queryParameters: queryParams);
      if (response.statusCode == 200) {
        final List<dynamic> rawData = response.data['data'] ?? [];
        final formattedData = rawData.map((price) => ({
          'crop_id': price['cropId'] ?? '',
          'crop_name': price['cropName'] ?? '',
          'market_name': price['marketName'] ?? '',
          'price': (price['pricePerKg'] ?? 0.0).toDouble(),
          'unit': price['unit'] ?? 'RWF/kg',
          'trend': price['trend'] ?? 'stable',
          'trend_percentage': (price['trendPercentage'] ?? 0.0).toDouble(),
          'last_updated': price['lastUpdated'] ?? DateTime.now().toIso8601String(),
        })).toList();
        if (formattedData.isNotEmpty) {
          await dbHelper.insertMarketPrices(formattedData);
          if (kDebugMode) debugPrint('💰 Pulled ${formattedData.length} market prices');
        }
        return formattedData.length;
      }
    } catch (e) {
      if (kDebugMode) debugPrint('⚠️ Failed to pull market prices: $e');
    }
    return 0;
  }

  /// Pull irrigation data
  Future<int> _pullIrrigationData(String farmId, DateTime? since) async {
    try {
      final queryParams = <String, dynamic>{'farmId': farmId};
      if (since != null) queryParams['since'] = since.toIso8601String();

      final response = await dio.get('/irrigation/status', queryParameters: queryParams);
      if (response.statusCode == 200) {
        final irrigationData = response.data['data'];
        await dbHelper.insertIrrigationData([{
          'farm_id': farmId,
          'zone_id': irrigationData['zoneId'] ?? '',
          'status': irrigationData['status'] ?? 'inactive',
          'moisture_level': (irrigationData['moistureLevel'] ?? 0.0).toDouble(),
          'started_at': irrigationData['lastWatered'] ?? DateTime.now().toIso8601String(),
          'finished_at': null,
        }]);
        if (kDebugMode) debugPrint('💧 Pulled irrigation data');
        return 1;
      }
    } catch (e) {
      if (kDebugMode) debugPrint('⚠️ Failed to pull irrigation data: $e');
    }
    return 0;
  }

  /// Pull notifications
  Future<int> _pullNotifications(String farmId, DateTime? since) async {
    try {
      final queryParams = <String, dynamic>{'userId': farmId};
      if (since != null) queryParams['since'] = since.toIso8601String();

      final response = await dio.get('/notifications', queryParameters: queryParams);
      if (response.statusCode == 200) {
        final List<dynamic> rawData = response.data['data'] ?? [];
        final formattedData = rawData.map((notif) => ({
          'remote_id': notif['id'] ?? '',
          'title': notif['title'] ?? '',
          'message': notif['message'] ?? '',
          'type': notif['type'] ?? 'info',
          'priority': notif['priority'] ?? 'low',
          'created_at': notif['createdAt'] ?? DateTime.now().toIso8601String(),
          'read_at': notif['readAt'],
        })).toList();
        if (formattedData.isNotEmpty) {
          await dbHelper.insertNotifications(formattedData);
          if (kDebugMode) debugPrint('🔔 Pulled ${formattedData.length} notifications');
        }
        return formattedData.length;
      }
    } catch (e) {
      if (kDebugMode) debugPrint('⚠️ Failed to pull notifications: $e');
    }
    return 0;
  }

  /// Format soil data for database insertion
  List<Map<String, dynamic>> _formatSoilData(List<dynamic> rawData, String farmId) {
    return rawData.map((e) => {
      'remote_id': e['id'],
      'farm_id': farmId,
      'moisture_percent': (e['moisturePercent'] ?? 0.0).toDouble(),
      'temp_celsius': (e['temperatureCelsius'] ?? 0.0).toDouble(),
      'ph_level': (e['phLevel'] ?? 0.0).toDouble(),
      'nitrogen': (e['nitrogen'] ?? 0.0).toDouble(),
      'phosphorus': (e['phosphorus'] ?? 0.0).toDouble(),
      'potassium': (e['potassium'] ?? 0.0).toDouble(),
      'reading_at': e['readingAt'] ?? e['createdAt'],
      'is_synced': 1,
    }).toList();
  }

  /// Queue an operation for later sync
  Future<void> queueOperation(String operation, String endpoint, Map<String, dynamic> payload) async {
    final syncItem = {
      'operation': operation,
      'endpoint': endpoint,
      'payload': jsonEncode(payload),
      'retry_count': 0,
      'created_at': DateTime.now().toIso8601String(),
    };

    await dbHelper.insertSyncItem(syncItem);
    if (kDebugMode) debugPrint('📝 Queued $operation operation for $endpoint');
  }


  /// Check sync status
  Future<SyncStatus> getSyncStatus() async {
    try {
      final lastSync = await dbHelper.getLastSyncTimestamp();
      final pendingCount = await dbHelper.getPendingSyncsCount();
      
      return SyncStatus(
        lastSyncTime: lastSync,
        pendingOperations: pendingCount,
        isOnline: await _isOnline(),
      );
    } catch (e) {
      return SyncStatus(
        lastSyncTime: null,
        pendingOperations: 0,
        isOnline: false,
        error: e.toString(),
      );
    }
  }

  Future<bool> _isOnline() async {
    try {
      final result = await Connectivity().checkConnectivity();
      return result != ConnectivityResult.none;
    } catch (e) {
      return false;
    }
  }
}

class SyncResult {
  final bool success;
  final String? error;
  final Duration duration;
  final int? recordsSynced;
  final DateTime? lastSyncTimestamp;

  SyncResult({
    required this.success,
    this.error,
    required this.duration,
    this.recordsSynced,
    this.lastSyncTimestamp,
  });
}

class SyncItemResult {
  final bool success;
  final String? error;

  SyncItemResult({required this.success, this.error});
}

class SyncStatus {
  final DateTime? lastSyncTime;
  final int pendingOperations;
  final bool isOnline;
  final String? error;

  SyncStatus({
    this.lastSyncTime,
    required this.pendingOperations,
    required this.isOnline,
    this.error,
  });
}
