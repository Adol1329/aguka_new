import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/cooperatives/domain/usecases/cooperative_usecases.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';

// Keep alias for backward compatibility with injection_container.dart
typedef CooperativeCubit = CooperativeBloc;

class CooperativeBloc extends Bloc<CooperativeEvent, CooperativeState> {
  final GetMyCooperativeUseCase _getMyCooperativeUseCase;
  final GetCooperativeMembersUseCase _getMembersUseCase;
  final AddCooperativeMemberUseCase _addMemberUseCase;

  CooperativeBloc({
    required GetMyCooperativeUseCase getMyCooperativeUseCase,
    required GetCooperativeMembersUseCase getMembersUseCase,
    required AddCooperativeMemberUseCase addMemberUseCase,
  })  : _getMyCooperativeUseCase = getMyCooperativeUseCase,
        _getMembersUseCase = getMembersUseCase,
        _addMemberUseCase = addMemberUseCase,
        super(const CooperativeState()) {
    on<FetchMyCooperative>(_onFetchMyCooperative);
    on<AddCooperativeMember>(_onAddMember);
  }

  Future<void> _onFetchMyCooperative(
      FetchMyCooperative event, Emitter<CooperativeState> emit) async {
    emit(state.copyWith(status: CooperativeStatus.loading));

    final coopResult = await _getMyCooperativeUseCase(NoParams());

    await coopResult.fold(
      (failure) async => emit(state.copyWith(
        status: CooperativeStatus.error,
        errorMessage: failure.message,
      )),
      (cooperative) async {
        // Fetch members after getting the cooperative
        final membersResult = await _getMembersUseCase(cooperative.id);
        membersResult.fold(
          (failure) => emit(state.copyWith(
            status: CooperativeStatus.loaded,
            cooperative: cooperative,
            members: const [],
          )),
          (members) => emit(state.copyWith(
            status: CooperativeStatus.loaded,
            cooperative: cooperative,
            members: members,
          )),
        );
      },
    );
  }

  Future<void> _onAddMember(
      AddCooperativeMember event, Emitter<CooperativeState> emit) async {
    final result = await _addMemberUseCase(AddMemberParams(
      cooperativeId: event.cooperativeId,
      phone: event.phone,
      fullName: event.fullName,
    ));

    result.fold(
      (failure) => emit(state.copyWith(
        status: CooperativeStatus.error,
        errorMessage: failure.message,
      )),
      (_) => add(FetchMyCooperative()), // Refresh the list
    );
  }
}
