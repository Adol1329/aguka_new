import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_cubit.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_event.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_state.dart';
import 'package:aguka_mobile/features/reports/domain/usecases/get_report_analytics_usecase.dart';
import 'package:aguka_mobile/features/reports/data/models/report_analytics_model.dart';

@GenerateMocks([GetReportAnalyticsUseCase])
import 'reports_bloc_test.mocks.dart';

void main() {
  late MockGetReportAnalyticsUseCase mockUseCase;

  setUp(() {
    mockUseCase = MockGetReportAnalyticsUseCase();
  });

  ReportsBloc buildBloc() => ReportsBloc(
        getAnalyticsUseCase: mockUseCase,
      );

  test('initial state has status == initial', () {
    expect(buildBloc().state.status, equals(ReportsStatus.initial));
  });

  group('FetchReportAnalytics', () {
    blocTest<ReportsBloc, ReportsState>(
      'emits loading then loaded state with analytics data',
      build: buildBloc,
      setUp: () {
        when(mockUseCase(NoParams()))
            .thenAnswer((_) async => Right(ReportAnalyticsModel.mock()));
      },
      act: (bloc) => bloc.add(FetchReportAnalytics()),
      expect: () => [
        predicate<ReportsState>((s) => s.status == ReportsStatus.loading),
        predicate<ReportsState>((s) => s.status == ReportsStatus.loaded),
      ],
      verify: (bloc) {
        expect(bloc.state.analytics, isNotNull);
        expect(bloc.state.analytics!.overview.score, greaterThan(0));
        expect(bloc.state.analytics!.recommendations, isNotEmpty);
      },
    );

    blocTest<ReportsBloc, ReportsState>(
      'emits loading then error state on failure',
      build: buildBloc,
      setUp: () {
        when(mockUseCase(NoParams()))
            .thenAnswer((_) async => Left(ServerFailure('Analytics unavailable')));
      },
      act: (bloc) => bloc.add(FetchReportAnalytics()),
      expect: () => [
        predicate<ReportsState>((s) => s.status == ReportsStatus.loading),
        predicate<ReportsState>((s) => s.status == ReportsStatus.error),
      ],
      verify: (bloc) {
        expect(bloc.state.errorMessage, equals('Analytics unavailable'));
        expect(bloc.state.analytics, isNull);
      },
    );

    blocTest<ReportsBloc, ReportsState>(
      'reloads successfully after a previous error',
      build: buildBloc,
      seed: () => const ReportsState(
        status: ReportsStatus.error,
        errorMessage: 'Previous error',
      ),
      setUp: () {
        when(mockUseCase(NoParams()))
            .thenAnswer((_) async => Right(ReportAnalyticsModel.mock()));
      },
      act: (bloc) => bloc.add(FetchReportAnalytics()),
      expect: () => [
        predicate<ReportsState>((s) => s.status == ReportsStatus.loading),
        predicate<ReportsState>((s) => s.status == ReportsStatus.loaded),
      ],
    );
  });
}
