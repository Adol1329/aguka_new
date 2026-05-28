import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';

abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Initial state before checking session
class AuthInitial extends AuthState {}

/// Checking existing session
class AuthLoading extends AuthState {}

/// User is authenticated
class AuthAuthenticated extends AuthState {
  final UserEntity user;

  const AuthAuthenticated({required this.user});

  @override
  List<Object?> get props => [user];
}

/// User is not authenticated
class AuthUnauthenticated extends AuthState {}

/// Auth operation failed
class AuthError extends AuthState {
  final String message;
  final String? code;

  const AuthError({required this.message, this.code});

  @override
  List<Object?> get props => [message, code];
}

/// Registration succeeded (can navigate to login or auto-login)
class AuthRegistered extends AuthState {
  final UserEntity user;

  const AuthRegistered({required this.user});

  @override
  List<Object?> get props => [user];
}

/// User is authenticated but pending administrative review
class AuthPendingReview extends AuthState {
  final UserEntity user;

  const AuthPendingReview({required this.user});

  @override
  List<Object?> get props => [user];
}
