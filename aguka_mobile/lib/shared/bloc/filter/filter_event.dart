import 'package:aguka_mobile/shared/data/models/filter_model.dart';

abstract class FilterEvent {}

class FilterUpdated extends FilterEvent {
  final FilterModel filter;
  FilterUpdated(this.filter);
}

class FilterReset extends FilterEvent {}
