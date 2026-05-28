import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/reports/domain/usecases/get_report_analytics_usecase.dart';
import 'reports_event.dart';
import 'reports_state.dart';

// Keep alias for backward compatibility with injection_container.dart
typedef ReportsCubit = ReportsBloc;

class ReportsBloc extends Bloc<ReportsEvent, ReportsState> {
  final GetReportAnalyticsUseCase _getAnalyticsUseCase;

  ReportsBloc({required GetReportAnalyticsUseCase getAnalyticsUseCase})
      : _getAnalyticsUseCase = getAnalyticsUseCase,
        super(const ReportsState()) {
    on<FetchReportAnalytics>(_onFetchAnalytics);
    on<DownloadReport>(_onDownloadReport);
  }

  Future<void> _onFetchAnalytics(
      FetchReportAnalytics event, Emitter<ReportsState> emit) async {
    emit(state.copyWith(status: ReportsStatus.loading));

    final result = await _getAnalyticsUseCase(NoParams());

    result.fold(
      (failure) => emit(state.copyWith(
        status: ReportsStatus.error,
        errorMessage: failure.message,
      )),
      (analytics) => emit(state.copyWith(
        status: ReportsStatus.loaded,
        analytics: analytics,
      )),
    );
  }

  Future<void> _onDownloadReport(
      DownloadReport event, Emitter<ReportsState> emit) async {
    // Download logic handled by URL launcher or share_plus in the UI
    // For now, this event is a no-op placeholder
  }
}
