import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';

class OnboardingUseCase implements UseCase<UserEntity, OnboardingParams> {
  final AuthRepository repository;

  OnboardingUseCase(this.repository);

  @override
  Future<Either<Failure, UserEntity>> call(OnboardingParams params) async {
    switch (params.role.toLowerCase()) {
      case 'farmer':
        return await repository.onboardFarmer(params.data);
      case 'officer':
      case 'extension_officer':
        return await repository.onboardOfficer(params.data);
      case 'cooperative':
      case 'cooperative_manager':
        return await repository.onboardCooperative(params.data);
      default:
        return Left(ServerFailure('Unsupported role for onboarding'));
    }
  }
}

class OnboardingParams {
  final String role;
  final Map<String, dynamic> data;

  OnboardingParams({required this.role, required this.data});
}
