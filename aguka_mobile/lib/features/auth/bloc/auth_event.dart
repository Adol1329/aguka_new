import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class AuthCheckRequested extends AuthEvent {}

class AuthLoginRequested extends AuthEvent {
  final String phone;
  final String password;

  const AuthLoginRequested({required this.phone, required this.password});

  @override
  List<Object?> get props => [phone, password];
}

class AuthRegisterRequested extends AuthEvent {
  final String phone;
  final String password;
  final String fullName;
  final String? email;
  final String language;
  final String role;

  const AuthRegisterRequested({
    required this.phone,
    required this.password,
    required this.fullName,
    required this.role,
    this.email,
    this.language = 'en',
  });

  @override
  List<Object?> get props => [phone, password, fullName, role, email, language];
}

class AuthOnboardingRequested extends AuthEvent {
  final String role;
  final Map<String, dynamic> data;

  const AuthOnboardingRequested({required this.role, required this.data});

  @override
  List<Object?> get props => [role, data];
}

class AuthLogoutRequested extends AuthEvent {}
