import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:aguka_mobile/core/constants/app_constants.dart';
import 'package:aguka_mobile/core/utils/preferences_helper.dart';

class DioClient {
  late final Dio dio;
  final PreferencesHelper prefs;

  DioClient(this.prefs) {
    dio = Dio();
    dio.options
      ..baseUrl = AppConstants.baseUrl
      ..connectTimeout = AppConstants.connectTimeout
      ..receiveTimeout = AppConstants.receiveTimeout
      ..headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

    if (kDebugMode) {
      dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint('API: $obj'),
      ));
    }

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = prefs.authToken;
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        options.headers['Accept-Language'] = prefs.language;
        handler.next(options);
      },
      onError: (DioException error, handler) async {
        // Handle token expiry: clear local session so AuthBloc re-checks on next action
        if (error.response?.statusCode == 401) {
          await prefs.clearAuth();
        }
        handler.next(error);
      },
    ));
  }
}
