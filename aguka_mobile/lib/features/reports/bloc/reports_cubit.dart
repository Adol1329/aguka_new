import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/reports/domain/repositories/reports_repository.dart';
import 'package:aguka_mobile/features/reports/domain/usecases/get_report_analytics_usecase.dart';
import 'reports_state.dart';

class ReportsCubit extends Cubit<ReportsState> {
  final GetReportAnalyticsUseCase _getAnalyticsUseCase;
  final ReportsRepository _repository;

  ReportsCubit({
    required GetReportAnalyticsUseCase getAnalyticsUseCase,
    required ReportsRepository repository,
  })  : _getAnalyticsUseCase = getAnalyticsUseCase,
        _repository = repository,
        super(const ReportsState());

  Future<void> fetchAnalytics(String role) async {
    emit(state.copyWith(status: ReportsStatus.loading));

    final result = await _getAnalyticsUseCase(role);

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

  Future<void> downloadReport(String role, String type) async {
    // Do not change the main status — report content must stay visible.
    final result = await _repository.downloadReport(role, type);
    result.fold(
      (failure) => emit(state.copyWith(downloadError: failure.message)),
      (url) => emit(state.copyWith(downloadUrl: url)),
    );
  }
}
