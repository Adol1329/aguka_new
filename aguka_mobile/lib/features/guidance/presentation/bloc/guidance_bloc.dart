import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/guidance/domain/repositories/guidance_repository.dart';
import 'guidance_event.dart';
import 'guidance_state.dart';

class GuidanceBloc extends Bloc<GuidanceEvent, GuidanceState> {
  final GuidanceRepository repository;

  GuidanceBloc({required this.repository}) : super(const GuidanceState()) {
    on<FetchGuidanceOverview>(_onFetchOverview);
    on<FetchCropGuidance>(_onFetchCropGuidance);
    on<FetchLivestockGuidance>(_onFetchLivestockGuidance);
  }

  Future<void> _onFetchOverview(
    FetchGuidanceOverview event,
    Emitter<GuidanceState> emit,
  ) async {
    emit(state.copyWith(status: GuidanceStatus.loading));
    final cropsResult = await repository.getCrops();
    final livestockResult = await repository.getLivestock();

    String? errorMessage;
    var crops = state.crops;
    var livestock = state.livestock;

    cropsResult.fold((failure) => errorMessage = failure.message, (value) => crops = value);
    livestockResult.fold((failure) => errorMessage ??= failure.message, (value) => livestock = value);

    if (errorMessage != null) {
      emit(state.copyWith(status: GuidanceStatus.error, errorMessage: errorMessage));
      return;
    }

    emit(state.copyWith(
      status: GuidanceStatus.loaded,
      crops: crops,
      livestock: livestock,
    ));
  }

  Future<void> _onFetchCropGuidance(
    FetchCropGuidance event,
    Emitter<GuidanceState> emit,
  ) async {
    emit(state.copyWith(status: GuidanceStatus.loading));
    final result = await repository.getCropGuidance(event.farmerCropId);
    result.fold(
      (failure) => emit(state.copyWith(status: GuidanceStatus.error, errorMessage: failure.message)),
      (guidance) => emit(state.copyWith(status: GuidanceStatus.loaded, cropGuidance: guidance)),
    );
  }

  Future<void> _onFetchLivestockGuidance(
    FetchLivestockGuidance event,
    Emitter<GuidanceState> emit,
  ) async {
    emit(state.copyWith(status: GuidanceStatus.loading));
    final result = await repository.getLivestockGuidance(event.livestockId);
    result.fold(
      (failure) => emit(state.copyWith(status: GuidanceStatus.error, errorMessage: failure.message)),
      (guidance) => emit(state.copyWith(status: GuidanceStatus.loaded, livestockGuidance: guidance)),
    );
  }
}
