import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/irrigation/domain/usecases/get_irrigation_status_usecase.dart';
import 'package:aguka_mobile/features/irrigation/domain/usecases/control_pump_usecase.dart';
import 'irrigation_event.dart';
import 'irrigation_state.dart';

class IrrigationBloc extends Bloc<IrrigationEvent, IrrigationState> {
  final GetIrrigationStatusUseCase _getStatusUseCase;
  final ControlPumpUseCase _controlPumpUseCase;

  IrrigationBloc({
    required GetIrrigationStatusUseCase getStatusUseCase,
    required ControlPumpUseCase controlPumpUseCase,
  })  : _getStatusUseCase = getStatusUseCase,
        _controlPumpUseCase = controlPumpUseCase,
        super(const IrrigationState()) {
    on<FetchIrrigationStatus>(_onFetchStatus);
    on<TogglePump>(_onTogglePump);
  }

  Future<void> _onFetchStatus(FetchIrrigationStatus event, Emitter<IrrigationState> emit) async {
    emit(state.copyWith(status: IrrigationStateStatus.loading));
    
    final result = await _getStatusUseCase(event.farmId);
    
    result.fold(
      (failure) => emit(state.copyWith(
        status: IrrigationStateStatus.error,
        errorMessage: failure.message,
      )),
      (data) => emit(state.copyWith(
        status: IrrigationStateStatus.loaded,
        data: data,
      )),
    );
  }

  Future<void> _onTogglePump(TogglePump event, Emitter<IrrigationState> emit) async {
    // Optionally emit a temporary loading state or optimistic update
    final result = await _controlPumpUseCase(ControlPumpParams(farmId: event.farmId, isActive: event.isActive));
    
    result.fold(
      (failure) => emit(state.copyWith(
        status: IrrigationStateStatus.error,
        errorMessage: failure.message,
      )),
      (data) => emit(state.copyWith(
        status: IrrigationStateStatus.loaded,
        data: data,
      )),
    );
  }
}
