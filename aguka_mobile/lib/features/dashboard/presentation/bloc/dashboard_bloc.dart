import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/dashboard_summary.dart';
import 'package:aguka_mobile/features/dashboard/domain/usecases/get_dashboard_summary.dart';

// Events
abstract class DashboardEvent extends Equatable {
  const DashboardEvent();
  @override
  List<Object?> get props => [];
}

class LoadDashboardData extends DashboardEvent {
  final String farmId;
  const LoadDashboardData(this.farmId);
  @override
  List<Object?> get props => [farmId];
}

// State
abstract class DashboardState extends Equatable {
  const DashboardState();
  @override
  List<Object?> get props => [];
}

class DashboardInitial extends DashboardState {}
class DashboardLoading extends DashboardState {}
class DashboardLoaded extends DashboardState {
  final DashboardSummary summary;
  const DashboardLoaded(this.summary);
  @override
  List<Object?> get props => [summary];
}
class DashboardError extends DashboardState {
  final String message;
  const DashboardError(this.message);
  @override
  List<Object?> get props => [message];
}

// BLoC
class DashboardBloc extends Bloc<DashboardEvent, DashboardState> {
  final GetDashboardSummaryUseCase getDashboardSummary;

  DashboardBloc({required this.getDashboardSummary}) : super(DashboardInitial()) {
    on<LoadDashboardData>((event, emit) async {
      emit(DashboardLoading());
      final result = await getDashboardSummary(event.farmId);
      result.fold(
        (failure) => emit(DashboardError(failure.message)),
        (summary) => emit(DashboardLoaded(summary)),
      );
    });
  }
}
