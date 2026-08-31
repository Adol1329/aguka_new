import 'package:equatable/equatable.dart';
import 'package:aguka_mobile/features/reports/domain/entities/report_entity.dart';

enum ReportsStatus { initial, loading, loaded, error }

class ReportsState extends Equatable {
  final ReportsStatus status;
  final ReportAnalyticsEntity? analytics;
  final String? errorMessage;
  final String? downloadUrl;
  final String? downloadError;

  const ReportsState({
    this.status = ReportsStatus.initial,
    this.analytics,
    this.errorMessage,
    this.downloadUrl,
    this.downloadError,
  });

  ReportsState copyWith({
    ReportsStatus? status,
    ReportAnalyticsEntity? analytics,
    String? errorMessage,
    String? downloadUrl,
    String? downloadError,
    bool clearDownloadUrl = false,
  }) {
    return ReportsState(
      status: status ?? this.status,
      analytics: analytics ?? this.analytics,
      errorMessage: errorMessage ?? this.errorMessage,
      downloadUrl: clearDownloadUrl ? null : (downloadUrl ?? this.downloadUrl),
      downloadError: clearDownloadUrl ? null : downloadError,
    );
  }

  @override
  List<Object?> get props =>
      [status, analytics, errorMessage, downloadUrl, downloadError];
}
