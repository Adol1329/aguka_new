import 'package:dartz/dartz.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../entities/cooperative_entity.dart';
import '../repositories/cooperative_repository.dart';

class GetMyCooperativeUseCase implements UseCase<CooperativeEntity, NoParams> {
  final CooperativeRepository repository;

  GetMyCooperativeUseCase(this.repository);

  @override
  Future<Either<Failure, CooperativeEntity>> call(NoParams params) async {
    return await repository.getMyCooperative();
  }
}

class GetCooperativeMembersUseCase implements UseCase<List<CooperativeMemberEntity>, String> {
  final CooperativeRepository repository;

  GetCooperativeMembersUseCase(this.repository);

  @override
  Future<Either<Failure, List<CooperativeMemberEntity>>> call(String cooperativeId) async {
    return await repository.getMembers(cooperativeId);
  }
}

class AddCooperativeMemberUseCase implements UseCase<void, AddMemberParams> {
  final CooperativeRepository repository;

  AddCooperativeMemberUseCase(this.repository);

  @override
  Future<Either<Failure, void>> call(AddMemberParams params) async {
    return await repository.addMember(params.cooperativeId, params.phone, params.fullName);
  }
}

class AddMemberParams {
  final String cooperativeId;
  final String phone;
  final String fullName;

  AddMemberParams({required this.cooperativeId, required this.phone, required this.fullName});
}
