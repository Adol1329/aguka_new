import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/shared/data/models/filter_model.dart';
import 'filter_event.dart';

class FilterState {
  final FilterModel filter;
  FilterState(this.filter);
}

class FilterBloc extends Bloc<FilterEvent, FilterState> {
  FilterBloc() : super(FilterState(FilterModel())) {
    on<FilterUpdated>((event, emit) => emit(FilterState(event.filter)));
    on<FilterReset>((event, emit) => emit(FilterState(FilterModel())));
  }
}
