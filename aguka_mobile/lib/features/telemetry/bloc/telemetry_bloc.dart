import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/telemetry/domain/usecases/telemetry_subscription_usecases.dart';
import 'package:aguka_mobile/features/telemetry/domain/usecases/get_latest_telemetry_usecase.dart';
import 'telemetry_event.dart';
import 'telemetry_state.dart';

class TelemetryBloc extends Bloc<TelemetryEvent, TelemetryState> {
  final SubscribeToTelemetryUseCase _subscribeUseCase;
  final UnsubscribeFromTelemetryUseCase _unsubscribeUseCase;
  final GetLatestTelemetryUseCase _getLatestUseCase;
  StreamSubscription? _telemetrySubscription;
  StreamSubscription? _connectionSubscription;

  TelemetryBloc({
    required SubscribeToTelemetryUseCase subscribeUseCase,
    required UnsubscribeFromTelemetryUseCase unsubscribeUseCase,
    required GetLatestTelemetryUseCase getLatestUseCase,
  })  : _subscribeUseCase = subscribeUseCase,
        _unsubscribeUseCase = unsubscribeUseCase,
        _getLatestUseCase = getLatestUseCase,
        super(const TelemetryState()) {
    on<StartTelemetrySubscription>(_onStartSubscription);
    on<StopTelemetrySubscription>(_onStopSubscription);
    on<FetchLatestTelemetry>(_onFetchLatest);
    on<TelemetryDataReceived>(_onDataReceived);
    on<ConnectionStatusChanged>(_onConnectionChanged);
  }

  Future<void> _onFetchLatest(FetchLatestTelemetry event, Emitter<TelemetryState> emit) async {
    emit(state.copyWith(status: TelemetryStatus.connecting));
    final result = await _getLatestUseCase(event.farmId);
    
    result.fold(
      (failure) => emit(state.copyWith(status: TelemetryStatus.error, errorMessage: failure.message)),
      (data) => emit(state.copyWith(status: TelemetryStatus.connected, latestData: data)),
    );
  }

  void _onStartSubscription(StartTelemetrySubscription event, Emitter<TelemetryState> emit) {
    emit(state.copyWith(status: TelemetryStatus.connecting));
    
    _subscribeUseCase();

    _telemetrySubscription?.cancel();
    _telemetrySubscription = _subscribeUseCase.telemetryStream.listen(
      (data) => add(TelemetryDataReceived(data)),
    );

    _connectionSubscription?.cancel();
    _connectionSubscription = _subscribeUseCase.connectionStream.listen(
      (isConnected) => add(ConnectionStatusChanged(isConnected)),
    );
  }

  void _onStopSubscription(StopTelemetrySubscription event, Emitter<TelemetryState> emit) {
    _telemetrySubscription?.cancel();
    _connectionSubscription?.cancel();
    _unsubscribeUseCase();
    emit(state.copyWith(status: TelemetryStatus.disconnected, isConnected: false));
  }

  void _onDataReceived(TelemetryDataReceived event, Emitter<TelemetryState> emit) {
    emit(state.copyWith(
      status: TelemetryStatus.connected,
      latestData: event.data,
    ));
  }

  void _onConnectionChanged(ConnectionStatusChanged event, Emitter<TelemetryState> emit) {
    emit(state.copyWith(
      status: event.isConnected ? TelemetryStatus.connected : TelemetryStatus.disconnected,
      isConnected: event.isConnected,
    ));
  }

  @override
  Future<void> close() {
    _telemetrySubscription?.cancel();
    _connectionSubscription?.cancel();
    _unsubscribeUseCase();
    return super.close();
  }
}
