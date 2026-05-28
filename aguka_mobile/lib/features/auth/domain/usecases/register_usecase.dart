import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class RegisterUseCase implements UseCase<UserEntity, RegisterParams> {
  final AuthRepository repository;

  RegisterUseCase(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call(RegisterParams params) async {
    return await repository.register(
      phone: params.phone,
      password: params.password,
      fullName: params.fullName,
      role: params.role,
      email: params.email,
    );
  }
}

class RegisterParams extends Equatable {
  final String phone;
  final String password;
  final String fullName;
  final String role;
  final String? email;

  const RegisterParams({
    required this.phone,
    required this.password,
    required this.fullName,
    required this.role,
    this.email,
  });

  @override
  List<Object?> get props => [phone, password, fullName, role, email];
}
