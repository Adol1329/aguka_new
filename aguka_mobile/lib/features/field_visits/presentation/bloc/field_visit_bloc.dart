import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/field_visits/domain/entities/field_visit_entity.dart';
import 'package:aguka_mobile/features/field_visits/domain/usecases/get_field_visits_usecase.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';

// Events
abstract class FieldVisitEvent extends Equatable {
  const FieldVisitEvent();

  @override
  List<Object?> get props => [];
}

class FetchFieldVisits extends FieldVisitEvent {}

// State
enum FieldVisitStatus { initial, loading, loaded, error }

class FieldVisitState extends Equatable {
  final FieldVisitStatus status;
  final List<FieldVisitEntity> visits;
  final String? errorMessage;

  const FieldVisitState({
    this.status = FieldVisitStatus.initial,
    this.visits = const [],
    this.errorMessage,
  });

  FieldVisitState copyWith({
    FieldVisitStatus? status,
    List<FieldVisitEntity>? visits,
    String? errorMessage,
  }) {
    return FieldVisitState(
      status: status ?? this.status,
      visits: visits ?? this.visits,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, visits, errorMessage];
}

// BLoC
class FieldVisitBloc extends Bloc<FieldVisitEvent, FieldVisitState> {
  final GetFieldVisitsUseCase getFieldVisitsUseCase;

  FieldVisitBloc({required this.getFieldVisitsUseCase})
      : super(const FieldVisitState()) {
    on<FetchFieldVisits>(_onFetchFieldVisits);
  }

  Future<void> _onFetchFieldVisits(
    FetchFieldVisits event,
    Emitter<FieldVisitState> emit,
  ) async {
    emit(state.copyWith(status: FieldVisitStatus.loading));
    final result = await getFieldVisitsUseCase(NoParams());
    result.fold(
      (failure) => emit(state.copyWith(
        status: FieldVisitStatus.error,
        errorMessage: failure.message,
      )),
      (visits) => emit(state.copyWith(
        status: FieldVisitStatus.loaded,
        visits: visits,
      )),
    );
  }
}
