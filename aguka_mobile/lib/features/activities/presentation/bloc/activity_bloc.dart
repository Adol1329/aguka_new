import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/activities/domain/repositories/activity_repository.dart';
import 'activity_event.dart';
import 'activity_state.dart';

class ActivityBloc extends Bloc<ActivityEvent, ActivityState> {
  final ActivityRepository repository;

  ActivityBloc({required this.repository}) : super(const ActivityState()) {
    on<FetchActivities>(_onFetchActivities);
    on<FetchActivityFormData>(_onFetchFormData);
    on<CreateActivityRequested>(_onCreateActivity);
  }

  Future<void> _onFetchActivities(
    FetchActivities event,
    Emitter<ActivityState> emit,
  ) async {
    emit(state.copyWith(status: ActivityStatus.loading));
    final result = await repository.getActivities();
    result.fold(
      (failure) => emit(state.copyWith(
        status: ActivityStatus.error,
        errorMessage: failure.message,
      )),
      (activities) => emit(state.copyWith(
        status: ActivityStatus.loaded,
        activities: activities,
      )),
    );
  }

  Future<void> _onFetchFormData(
    FetchActivityFormData event,
    Emitter<ActivityState> emit,
  ) async {
    emit(state.copyWith(status: ActivityStatus.loading));
    final typesResult = await repository.getActivityTypes();
    final cropsResult = await repository.getFarmerCrops();

    String? errorMessage;
    List<String> types = const [];
    List crops = const [];

    typesResult.fold((failure) => errorMessage = failure.message, (value) => types = value);
    cropsResult.fold((failure) => errorMessage ??= failure.message, (value) => crops = value);

    if (errorMessage != null) {
      emit(state.copyWith(status: ActivityStatus.error, errorMessage: errorMessage));
      return;
    }

    emit(state.copyWith(
      status: ActivityStatus.loaded,
      activityTypes: types,
      crops: crops.cast(),
    ));
  }

  Future<void> _onCreateActivity(
    CreateActivityRequested event,
    Emitter<ActivityState> emit,
  ) async {
    emit(state.copyWith(status: ActivityStatus.submitting));
    final result = await repository.createActivity(
      activityType: event.activityType,
      description: event.description,
      activityDate: event.activityDate,
      cropId: event.cropId,
    );
    result.fold(
      (failure) => emit(state.copyWith(
        status: ActivityStatus.error,
        errorMessage: failure.message,
      )),
      (_) => emit(state.copyWith(status: ActivityStatus.success)),
    );
  }
}
