import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/cooperatives/domain/repositories/cooperative_repository.dart';
import 'package:aguka_mobile/features/cooperatives/domain/usecases/cooperative_usecases.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_event.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/bloc/cooperative_state.dart';

// Keep alias for backward compatibility with injection_container.dart
typedef CooperativeCubit = CooperativeBloc;

class CooperativeBloc extends Bloc<CooperativeEvent, CooperativeState> {
  final GetMyCooperativeUseCase _getMyCooperativeUseCase;
  final GetCooperativeMembersUseCase _getMembersUseCase;
  final AddCooperativeMemberUseCase _addMemberUseCase;
  final CooperativeRepository _repository;

  CooperativeBloc({
    required GetMyCooperativeUseCase getMyCooperativeUseCase,
    required GetCooperativeMembersUseCase getMembersUseCase,
    required AddCooperativeMemberUseCase addMemberUseCase,
    required CooperativeRepository repository,
  })  : _getMyCooperativeUseCase = getMyCooperativeUseCase,
        _getMembersUseCase = getMembersUseCase,
        _addMemberUseCase = addMemberUseCase,
        _repository = repository,
        super(const CooperativeState()) {
    on<FetchMyCooperative>(_onFetchMyCooperative);
    on<AddCooperativeMember>(_onAddMember);
    on<FetchJoinRequests>(_onFetchJoinRequests);
    on<ApproveJoinRequest>(_onApproveJoinRequest);
    on<RejectJoinRequest>(_onRejectJoinRequest);
    on<FetchCooperativeActivities>(_onFetchActivities);
    on<FetchCooperativeResources>(_onFetchResources);
    on<FetchCooperativeList>(_onFetchCooperativeList);
    on<CreateCooperativeActivity>(_onCreateActivity);
    on<AddCooperativeResource>(_onAddResource);
    on<RequestMembership>(_onRequestMembership);
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
      (_) => add(FetchMyCooperative()),
    );
  }

  Future<void> _onFetchJoinRequests(
      FetchJoinRequests event, Emitter<CooperativeState> emit) async {
    final result = await _repository.getJoinRequests(event.cooperativeId);
    result.fold(
      (failure) => emit(state.copyWith(errorMessage: failure.message)),
      (requests) => emit(state.copyWith(joinRequests: requests)),
    );
  }

  Future<void> _onApproveJoinRequest(
      ApproveJoinRequest event, Emitter<CooperativeState> emit) async {
    final result = await _repository.approveJoinRequest(
        event.cooperativeId, event.requestId);
    result.fold(
      (failure) => emit(state.copyWith(
        status: CooperativeStatus.error,
        errorMessage: failure.message,
      )),
      (_) {
        final updated = state.joinRequests
            .where((r) => r.id != event.requestId)
            .toList();
        emit(state.copyWith(joinRequests: updated));
        add(FetchMyCooperative());
      },
    );
  }

  Future<void> _onRejectJoinRequest(
      RejectJoinRequest event, Emitter<CooperativeState> emit) async {
    final result = await _repository.rejectJoinRequest(
        event.cooperativeId, event.requestId);
    result.fold(
      (failure) => emit(state.copyWith(
        status: CooperativeStatus.error,
        errorMessage: failure.message,
      )),
      (_) {
        final updated = state.joinRequests
            .where((r) => r.id != event.requestId)
            .toList();
        emit(state.copyWith(joinRequests: updated));
      },
    );
  }

  Future<void> _onFetchActivities(
      FetchCooperativeActivities event, Emitter<CooperativeState> emit) async {
    final result = await _repository.getActivities(event.cooperativeId);
    result.fold(
      (failure) => emit(state.copyWith(errorMessage: failure.message)),
      (activities) => emit(state.copyWith(activities: activities)),
    );
  }

  Future<void> _onFetchResources(
      FetchCooperativeResources event, Emitter<CooperativeState> emit) async {
    final result = await _repository.getResources(event.cooperativeId);
    result.fold(
      (failure) => emit(state.copyWith(errorMessage: failure.message)),
      (resources) => emit(state.copyWith(resources: resources)),
    );
  }

  Future<void> _onFetchCooperativeList(
      FetchCooperativeList event, Emitter<CooperativeState> emit) async {
    // Only show loading spinner if we have no cooperative data yet (avoids
    // overwriting an already-loaded cooperative card for farmers with a cooperative)
    if (state.cooperative == null) {
      emit(state.copyWith(status: CooperativeStatus.loading));
    }
    final result = await _repository.getCooperativeList();
    result.fold(
      (failure) => emit(state.copyWith(
        status: state.cooperative == null
            ? CooperativeStatus.error
            : state.status,
        errorMessage: failure.message,
      )),
      (list) => emit(state.copyWith(
        status: CooperativeStatus.loaded,
        cooperativeList: list,
      )),
    );
  }

  Future<void> _onCreateActivity(
      CreateCooperativeActivity event, Emitter<CooperativeState> emit) async {
    final result = await _repository.createActivity(
      event.cooperativeId,
      {
        'title': event.title,
        'activityType': event.activityType,
        'scheduledAt': event.scheduledAt.toIso8601String(),
        if (event.location != null) 'location': event.location,
        if (event.description != null) 'description': event.description,
        if (event.expectedParticipants != null)
          'expectedParticipants': event.expectedParticipants,
      },
    );
    result.fold(
      (failure) => emit(state.copyWith(errorMessage: failure.message)),
      (_) => add(FetchCooperativeActivities(event.cooperativeId)),
    );
  }

  Future<void> _onAddResource(
      AddCooperativeResource event, Emitter<CooperativeState> emit) async {
    final result = await _repository.addResource(
      event.cooperativeId,
      {
        'name': event.name,
        'resourceType': event.resourceType,
        if (event.category != null) 'category': event.category,
        if (event.quantity != null) 'quantity': event.quantity,
        if (event.unit != null) 'unit': event.unit,
        if (event.location != null) 'location': event.location,
        if (event.condition != null) 'condition': event.condition,
      },
    );
    result.fold(
      (failure) => emit(state.copyWith(errorMessage: failure.message)),
      (_) => add(FetchCooperativeResources(event.cooperativeId)),
    );
  }

  Future<void> _onRequestMembership(
      RequestMembership event, Emitter<CooperativeState> emit) async {
    emit(state.copyWith(
        membershipRequestStatus: MembershipRequestStatus.sending));
    final result = await _repository.requestMembership(event.cooperativeId);
    result.fold(
      (failure) => emit(state.copyWith(
        membershipRequestStatus: MembershipRequestStatus.error,
        errorMessage: failure.message,
      )),
      (_) => emit(state.copyWith(
          membershipRequestStatus: MembershipRequestStatus.sent)),
    );
  }
}
