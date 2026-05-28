import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/reports/domain/entities/report_entity.dart';

enum ReportsStatus { initial, loading, loaded, error }

class ReportsState extends Equatable {
  final ReportsStatus status;
  final ReportAnalyticsEntity? analytics;
  final String? errorMessage;

  const ReportsState({
    this.status = ReportsStatus.initial,
    this.analytics,
    this.errorMessage,
  });

  ReportsState copyWith({
    ReportsStatus? status,
    ReportAnalyticsEntity? analytics,
    String? errorMessage,
  }) {
    return ReportsState(
      status: status ?? this.status,
      analytics: analytics ?? this.analytics,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  @override
  List<Object?> get props => [status, analytics, errorMessage];
}
