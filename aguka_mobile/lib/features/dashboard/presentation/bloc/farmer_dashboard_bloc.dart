import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/farmer_dashboard_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/usecases/get_farmer_dashboard.dart';

abstract class FarmerDashboardEvent extends Equatable {
  const FarmerDashboardEvent();
  @override
  List<Object?> get props => [];
}

class FetchFarmerDashboard extends FarmerDashboardEvent {}

enum FarmerDashboardStatus { initial, loading, loaded, error }

class FarmerDashboardState extends Equatable {
  final FarmerDashboardStatus status;
  final FarmerDashboardData data;
  final String? errorMessage;

  const FarmerDashboardState({
    this.status = FarmerDashboardStatus.initial,
    this.data = const FarmerDashboardData(),
    this.errorMessage,
  });

  FarmerDashboardState copyWith({
    FarmerDashboardStatus? status,
    FarmerDashboardData? data,
    String? errorMessage,
  }) {
    return FarmerDashboardState(
      status: status ?? this.status,
      data: data ?? this.data,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, data, errorMessage];
}

class FarmerDashboardBloc
    extends Bloc<FarmerDashboardEvent, FarmerDashboardState> {
  final GetFarmerDashboardUseCase getFarmerDashboardUseCase;

  FarmerDashboardBloc({required this.getFarmerDashboardUseCase})
      : super(const FarmerDashboardState()) {
    on<FetchFarmerDashboard>(_onFetch);
  }

  Future<void> _onFetch(
    FetchFarmerDashboard event,
    Emitter<FarmerDashboardState> emit,
  ) async {
    emit(state.copyWith(status: FarmerDashboardStatus.loading));
    final result = await getFarmerDashboardUseCase(NoParams());
    result.fold(
      (failure) => emit(state.copyWith(
        status: FarmerDashboardStatus.error,
        errorMessage: failure.message,
      )),
      (data) => emit(state.copyWith(
        status: FarmerDashboardStatus.loaded,
        data: data,
      )),
    );
  }
}
