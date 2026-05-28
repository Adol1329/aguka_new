import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

class LoginUseCase implements UseCase<UserEntity, LoginParams> {
  final AuthRepository repository;

  LoginUseCase(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call(LoginParams params) async {
    return await repository.login(
      phone: params.phone,
      password: params.password,
    );
  }
}

class LoginParams extends Equatable {
  final String phone;
  final String password;

  const LoginParams({required this.phone, required this.password});

  @override
  List<Object?> get props => [phone, password];
}
