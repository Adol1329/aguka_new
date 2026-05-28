import 'package:equatable/equatable.dart';

abstract class ReportsEvent extends Equatable {
  const ReportsEvent();

  @override
  List<Object?> get props => [];
}

class FetchReportAnalytics extends ReportsEvent {}

class DownloadReport extends ReportsEvent {
  final String type;
  const DownloadReport(this.type);

  @override
  List<Object?> get props => [type];
}
