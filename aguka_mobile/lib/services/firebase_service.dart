import 'dart:io';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:dio/dio.dart';

/// Top-level function to handle background FCM messages
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint("Handling a background message: \${message.messageId}");
  // Here we could trigger a local SQLite update or show a local notification
}

class FirebaseService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // Request permission for iOS/Android 13+
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted permission');
      
      // Get the FCM token for this device to send to the backend
      String? token = await _firebaseMessaging.getToken();
      debugPrint("FCM Token: $token");
      
      // Post this token to your /api/v1/notifications/devices endpoint
      if (token != null) {
        try {
          final dio = sl<Dio>();
          await dio.post(
            '/notifications/devices',
            data: {
              'fcmToken': token,
              'platform': Platform.isAndroid ? 'android' : 'ios',
            },
          );
          debugPrint('FCM token posted to backend successfully');
        } catch (e) {
          debugPrint('Failed to post FCM token: $e');
        }
      }
      
      // Handle foreground messages
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        debugPrint('Received a foreground message: ${message.notification?.title}');
        // Display an in-app banner or dialog
      });
      
      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
      
    } else {
      debugPrint('User declined or has not accepted permission');
    }
  }

  /// Subscribe to topics (e.g., district-wide alerts or cooperative broadcasts)
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
    debugPrint("Subscribed to FCM topic: \$topic");
  }
}
