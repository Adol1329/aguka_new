import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/officer_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/usecases/get_officer_dashboard.dart';

abstract class OfficerDashboardEvent extends Equatable {
  const OfficerDashboardEvent();
  @override
  List<Object?> get props => [];
}

class FetchOfficerDashboard extends OfficerDashboardEvent {}

enum OfficerDashboardStatus { initial, loading, loaded, error }

class OfficerDashboardState extends Equatable {
  final OfficerDashboardStatus status;
  final OfficerDashboardData data;
  final String? errorMessage;

  const OfficerDashboardState({
    this.status = OfficerDashboardStatus.initial,
    this.data = const OfficerDashboardData(),
    this.errorMessage,
  });

  OfficerDashboardState copyWith({
    OfficerDashboardStatus? status,
    OfficerDashboardData? data,
    String? errorMessage,
  }) {
    return OfficerDashboardState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, data, errorMessage];
}

class OfficerDashboardBloc
    extends Bloc<OfficerDashboardEvent, OfficerDashboardState> {
  final GetOfficerDashboardUseCase getOfficerDashboardUseCase;

  OfficerDashboardBloc({required this.getOfficerDashboardUseCase})
      : super(const OfficerDashboardState()) {
    on<FetchOfficerDashboard>(_onFetch);
  }

  Future<void> _onFetch(
    FetchOfficerDashboard event,
    Emitter<OfficerDashboardState> emit,
  ) async {
    emit(state.copyWith(status: OfficerDashboardStatus.loading));
    final result = await getOfficerDashboardUseCase(NoParams());
    result.fold(
      (failure) => emit(state.copyWith(
        status: OfficerDashboardStatus.error,
        errorMessage: failure.message,
      )),
      (data) => emit(state.copyWith(
        status: OfficerDashboardStatus.loaded,
        data: data,
      )),
    );
  }
}
