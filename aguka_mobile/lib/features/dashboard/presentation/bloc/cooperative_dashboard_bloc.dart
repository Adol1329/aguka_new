import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/cooperative_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/usecases/get_cooperative_dashboard.dart';

abstract class CooperativeDashboardEvent extends Equatable {
  const CooperativeDashboardEvent();
  @override
  List<Object?> get props => [];
}

class FetchCooperativeDashboard extends CooperativeDashboardEvent {
  final String cooperativeId;

  const FetchCooperativeDashboard(this.cooperativeId);

  @override
  List<Object?> get props => [cooperativeId];
}

enum CooperativeDashboardStatus { initial, loading, loaded, error }

class CooperativeDashboardState extends Equatable {
  final CooperativeDashboardStatus status;
  final CooperativeDashboardData data;
  final String? errorMessage;

  const CooperativeDashboardState({
    this.status = CooperativeDashboardStatus.initial,
    this.data = const CooperativeDashboardData(),
    this.errorMessage,
  });

  CooperativeDashboardState copyWith({
    CooperativeDashboardStatus? status,
    CooperativeDashboardData? data,
    String? errorMessage,
  }) {
    return CooperativeDashboardState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, data, errorMessage];
}

class CooperativeDashboardBloc
    extends Bloc<CooperativeDashboardEvent, CooperativeDashboardState> {
  final GetCooperativeDashboardUseCase getCooperativeDashboardUseCase;

  CooperativeDashboardBloc(
      {required this.getCooperativeDashboardUseCase})
      : super(const CooperativeDashboardState()) {
    on<FetchCooperativeDashboard>(_onFetch);
  }

  Future<void> _onFetch(
    FetchCooperativeDashboard event,
    Emitter<CooperativeDashboardState> emit,
  ) async {
    emit(state.copyWith(status: CooperativeDashboardStatus.loading));
    final result =
        await getCooperativeDashboardUseCase(event.cooperativeId);
    result.fold(
      (failure) => emit(state.copyWith(
        status: CooperativeDashboardStatus.error,
        errorMessage: failure.message,
      )),
      (data) => emit(state.copyWith(
        status: CooperativeDashboardStatus.loaded,
        data: data,
      )),
    );
  }
}
