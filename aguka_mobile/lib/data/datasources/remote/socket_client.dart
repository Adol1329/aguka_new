import 'dart:async';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:aguka_mobile/core/config/app_config.dart';
import 'package:aguka_mobile/core/utils/preferences_helper.dart';
import 'package:logger/logger.dart';

class SocketClient {
  final PreferencesHelper _prefs;
  final Logger _logger = Logger();
  io.Socket? _socket;
  
  // Streams for telemetry, alerts, and notifications
  final _telemetryController = StreamController<Map<String, dynamic>>.broadcast();
  final _alertController = StreamController<Map<String, dynamic>>.broadcast();
  final _notificationController = StreamController<Map<String, dynamic>>.broadcast();
  final _communityController = StreamController<Map<String, dynamic>>.broadcast();
  final _connectionController = StreamController<bool>.broadcast();

  Stream<Map<String, dynamic>> get telemetryStream => _telemetryController.stream;
  Stream<Map<String, dynamic>> get alertStream => _alertController.stream;
  Stream<Map<String, dynamic>> get notificationStream => _notificationController.stream;
  Stream<Map<String, dynamic>> get communityStream => _communityController.stream;
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

    _logger.i('Connecting to Socket IO: $baseUrl');

    _socket = io.io(baseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'extraHeaders': {'Authorization': 'Bearer ${_prefs.authToken ?? ''}'},
    });

    _socket!.onConnect((_) {
      _logger.i('Socket connected: ${_socket!.id}');
      _connectionController.add(true);

      // Read the latest token from prefs (may have been refreshed)
      final latestToken = _prefs.authToken;
      if (latestToken != null) {
        _socket!.emit('authenticate', {'token': latestToken});
      }
    });

    _socket!.onDisconnect((_) {
      _logger.w('Socket disconnected');
      _connectionController.add(false);
    });

    _socket!.onConnectError((err) => _logger.e('Socket Connect Error: $err'));
    _socket!.onError((err) => _logger.e('Socket Error: $err'));

    // Authentication response — retry with fresh token if it failed
    _socket!.on('authenticated', (data) {
      if (data['success'] == true) {
        _logger.i('Socket authenticated successfully');
      } else {
        _logger.e('Socket authentication failed: ${data['error']}');
        // Read the latest token (may have been refreshed since connect())
        final retryToken = _prefs.authToken;
        if (retryToken != null) {
          _logger.i('Retrying socket authentication with fresh token...');
          _socket!.emit('authenticate', {'token': retryToken});
        }
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

    // Listen for new notifications (Production hardening)
    _socket!.on('notification:new', (data) {
      _logger.i('New notification received via socket: $data');
      _notificationController.add(Map<String, dynamic>.from(data));
    });

    // Community standardized events
    _socket!.on('community:post:new', (data) {
      _logger.i('New community post received: $data');
      _communityController.add({'event': 'post:new', 'data': data});
    });

    _socket!.on('community:comment:new', (data) {
      _logger.i('New community comment received: $data');
      _communityController.add({'event': 'comment:new', 'data': data});
    });

    _socket!.on('community:reaction:new', (data) {
      _logger.d('Community reaction received: $data');
      _communityController.add({'event': 'reaction:new', 'data': data});
    });

    _socket!.on('community:post:deleted', (data) {
      _logger.i('Community post deleted: $data');
      _communityController.add({'event': 'post:deleted', 'data': data});
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
    _notificationController.close();
    _communityController.close();
    _connectionController.close();
  }

  bool get isConnected => _socket?.connected ?? false;
}
