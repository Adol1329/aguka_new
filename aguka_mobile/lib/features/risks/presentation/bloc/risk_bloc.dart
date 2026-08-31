import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/risks/domain/entities/risk_entity.dart';
import 'package:aguka_mobile/features/risks/domain/usecases/get_active_risks_usecase.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';

// Events
abstract class RiskEvent extends Equatable {
  const RiskEvent();

  @override
  List<Object?> get props => [];
}

class FetchActiveRisks extends RiskEvent {}

// State
enum RiskStatus { initial, loading, loaded, error }

class RiskState extends Equatable {
  final RiskStatus status;
  final List<RiskEntity> risks;
  final String? errorMessage;

  const RiskState({
    this.status = RiskStatus.initial,
    this.risks = const [],
    this.errorMessage,
  });

  RiskState copyWith({
    RiskStatus? status,
    List<RiskEntity>? risks,
    String? errorMessage,
  }) {
    return RiskState(
      status: status ?? this.status,
      risks: risks ?? this.risks,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, risks, errorMessage];
}

// BLoC
class RiskBloc extends Bloc<RiskEvent, RiskState> {
  final GetActiveRisksUseCase getActiveRisksUseCase;

  RiskBloc({required this.getActiveRisksUseCase})
      : super(const RiskState()) {
    on<FetchActiveRisks>(_onFetchActiveRisks);
  }

  Future<void> _onFetchActiveRisks(
    FetchActiveRisks event,
    Emitter<RiskState> emit,
  ) async {
    emit(state.copyWith(status: RiskStatus.loading));
    final result = await getActiveRisksUseCase(NoParams());
    result.fold(
      (failure) => emit(state.copyWith(
        status: RiskStatus.error,
        errorMessage: failure.message,
      )),
      (risks) => emit(state.copyWith(
        status: RiskStatus.loaded,
        risks: risks,
      )),
    );
  }
}
