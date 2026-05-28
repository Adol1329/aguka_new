abstract class Failure {
  final String message;
  final String? code;
  const Failure({required this.message, this.code});

  @override
  String toString() => 'Failure(message: $message, code: $code)';
}

class NetworkFailure extends Failure {
  const NetworkFailure({super.message = 'No internet connection.', super.code = 'NETWORK_ERROR'});
}

class ServerFailure extends Failure {
  const ServerFailure({required super.message, super.code = 'SERVER_ERROR'});
}

class AuthFailure extends Failure {
  const AuthFailure({required super.message, super.code = 'AUTH_ERROR'});
}

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure({super.message = 'Session expired. Please log in again.', super.code = 'AUTH_TOKEN_EXPIRED'});
}

class ValidationFailure extends Failure {
  const ValidationFailure({required super.message, super.code = 'VALIDATION_ERROR'});
}

class CacheFailure extends Failure {
  const CacheFailure({super.message = 'Local storage error.', super.code = 'CACHE_ERROR'});
}

class NotFoundFailure extends Failure {
  const NotFoundFailure({super.message = 'Resource not found.', super.code = 'RESOURCE_NOT_FOUND'});
}

class UnknownFailure extends Failure {
  const UnknownFailure({super.message = 'An unexpected error occurred.', super.code = 'UNKNOWN_ERROR'});
}
