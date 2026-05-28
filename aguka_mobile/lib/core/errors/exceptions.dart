import 'package:dio/dio.dart';

class AppException implements Exception {
  final String message;
  final String? code;
  final int? statusCode;

  AppException({required this.message, this.code, this.statusCode});

  factory AppException.fromDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return AppException(
          message: 'Connection timeout. Please check your internet.',
          code: 'TIMEOUT',
        );
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode ?? 0;
        final data = error.response?.data;
        String message = 'An error occurred';
        
        if (data is Map && data['message'] != null) {
          message = data['message'].toString();
        }
        
        return AppException(
          message: message,
          code: 'HTTP_$statusCode',
          statusCode: statusCode,
        );
      case DioExceptionType.cancel:
        return AppException(
          message: 'Request cancelled',
          code: 'CANCELLED',
        );
      default:
        return AppException(
          message: 'Network error. Please check your connection.',
          code: 'NETWORK_ERROR',
        );
    }
  }

  @override
  String toString() => 'AppException: $message (Code: $code)';
}
