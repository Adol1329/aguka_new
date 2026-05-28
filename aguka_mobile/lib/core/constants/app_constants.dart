import '../config/app_config.dart';

class AppConstants {
  static String get baseUrl => AppConfig.baseUrl;
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
