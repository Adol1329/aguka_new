import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:aguka_mobile/core/config/app_config.dart';
import 'package:aguka_mobile/core/utils/preferences_helper.dart';
import 'package:logger/logger.dart';

class SocketClient {
  final PreferencesHelper _prefs;
  final Logger _logger = Logger();
  io.Socket? _socket;
  
  // Streams for telemetry and alerts
  final _telemetryController = StreamController<Map<String, dynamic>>.broadcast();
  final _alertController = StreamController<Map<String, dynamic>>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();

  Stream<Map<String, dynamic>> get telemetryStream => _telemetryController.stream;
  Stream<Map<String, dynamic>> get alertStream => _alertController.stream;
  Stream<bool> get connectionStream => _connectionController.stream;

  SocketClient(this._prefs);

  void connect({bool forceReconnect = false}) {
    if (_socket != null && _socket!.connected && !forceReconnect) {
      // If already connected and not forcing reconnect, just ensure we are authenticated
      final token = _prefs.authToken;
      if (token != null) {
        _logger.i('Socket already connected, re-authenticating...');
        _socket!.emit('authenticate', {'token': token});
      }
      return;
    }

    if (forceReconnect) {
      disconnect();
    }

    final baseUrl = AppConfig.baseUrl.replaceAll('/api/v1', '');
    final token = _prefs.authToken;

    _logger.i('Connecting to Socket IO: $baseUrl');

    _socket = io.io(baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'extraHeaders': token != null ? {'Authorization': 'Bearer $token'} : null,
    });

    _socket!.onConnect((_) {
      _logger.i('Socket connected: ${_socket!.id}');
      _connectionController.add(true);
      
      // Authenticate with the token
      if (token != null) {
        _socket!.emit('authenticate', {'token': token});
      }
    });

    _socket!.onDisconnect((_) {
      _logger.w('Socket disconnected');
      _connectionController.add(false);
    });

    _socket!.onConnectError((err) => _logger.e('Socket Connect Error: $err'));
    _socket!.onError((err) => _logger.e('Socket Error: $err'));

    // Authentication response
    _socket!.on('authenticated', (data) {
      if (data['success'] == true) {
        _logger.i('Socket authenticated successfully');
      } else {
        _logger.e('Socket authentication failed: ${data['error']}');
      }
    });

    // Listen for telemetry updates
    _socket!.on('telemetry_update', (data) {
      _logger.d('Telemetry received: $data');
      _telemetryController.add(Map<String, dynamic>.from(data));
    });

    // Listen for new alerts
    _socket!.on('new_alert', (data) {
      _logger.i('New alert received: $data');
      _alertController.add(Map<String, dynamic>.from(data));
    });

    _socket!.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void dispose() {
    disconnect();
    _telemetryController.close();
    _alertController.close();
    _connectionController.close();
  }

  bool get isConnected => _socket?.connected ?? false;
}
