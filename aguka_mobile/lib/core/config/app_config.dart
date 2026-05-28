import 'dart:io';

enum Environment { dev, prod }

class AppConfig {
  static Environment environment = Environment.dev;

  // Change this to your local machine IP for physical device testing
  // For Android Emulator, use 10.0.2.2
  // For physical devices, use your machine's actual IP address
  static const String _localIp = '10.24.0.91';

  static String get baseUrl {
    if (environment == Environment.prod) {
      return 'https://api.aguka.rw/api/v1';
    }

    // Handle Emulator vs Physical Device for Development
    // For physical devices (like Infinix X665), use the local IP of your machine
    // For Android Emulator, you can also use 10.0.2.2 if not on a physical device
    if (Platform.isAndroid) {
      return 'http://$_localIp:3000/api/v1';
    } else if (Platform.isIOS) {
      return 'http://localhost:3000/api/v1';
    } else {
      return 'http://$_localIp:3000/api/v1';
    }
  }

  static const String appName = 'Aguka Smart Farming Kit';
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
