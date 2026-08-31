import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_cubit.dart';
import 'package:aguka_mobile/features/reports/bloc/reports_state.dart';
import 'package:aguka_mobile/features/reports/domain/repositories/reports_repository.dart';
import 'package:aguka_mobile/features/reports/domain/usecases/get_report_analytics_usecase.dart';
import 'package:aguka_mobile/features/reports/data/models/report_analytics_model.dart';

class MockReportsRepository extends Mock implements ReportsRepository {}

@GenerateMocks([GetReportAnalyticsUseCase])
import 'reports_bloc_test.mocks.dart';

void main() {
  late MockGetReportAnalyticsUseCase mockUseCase;
  late MockReportsRepository mockRepo;

  setUp(() {
    mockUseCase = MockGetReportAnalyticsUseCase();
    mockRepo = MockReportsRepository();
  });

  ReportsCubit buildCubit() => ReportsCubit(
        getAnalyticsUseCase: mockUseCase,
        repository: mockRepo,
      );

  test('initial state has status == initial', () {
    expect(buildCubit().state.status, equals(ReportsStatus.initial));
  });

  group('FetchReportAnalytics', () {
    blocTest<ReportsCubit, ReportsState>(
      'emits loading then loaded state with analytics data',
      build: buildCubit,
      setUp: () {
        when(mockUseCase(NoParams()))
            .thenAnswer((_) async => Right(ReportAnalyticsModel.mock()));
      },
      act: (cubit) => cubit.fetchAnalytics(),
      expect: () => [
        predicate<ReportsState>((s) => s.status == ReportsStatus.loading),
        predicate<ReportsState>((s) => s.status == ReportsStatus.loaded),
      ],
      verify: (cubit) {
        expect(cubit.state.analytics, isNotNull);
        expect(cubit.state.analytics!.overview.score, greaterThan(0));
        expect(cubit.state.analytics!.recommendations, isNotEmpty);
      },
    );

    blocTest<ReportsCubit, ReportsState>(
      'emits loading then error state on failure',
      build: buildCubit,
      setUp: () {
        when(mockUseCase(NoParams()))
            .thenAnswer((_) async => Left(ServerFailure('Analytics unavailable')));
      },
      act: (cubit) => cubit.fetchAnalytics(),
      expect: () => [
        predicate<ReportsState>((s) => s.status == ReportsStatus.loading),
        predicate<ReportsState>((s) => s.status == ReportsStatus.error),
      ],
      verify: (cubit) {
        expect(cubit.state.errorMessage, equals('Analytics unavailable'));
        expect(cubit.state.analytics, isNull);
      },
    );

    blocTest<ReportsCubit, ReportsState>(
      'reloads successfully after a previous error',
      build: buildCubit,
      seed: () => const ReportsState(
        status: ReportsStatus.error,
        errorMessage: 'Previous error',
      ),
      setUp: () {
        when(mockUseCase(NoParams()))
            .thenAnswer((_) async => Right(ReportAnalyticsModel.mock()));
      },
      act: (cubit) => cubit.fetchAnalytics(),
      expect: () => [
        predicate<ReportsState>((s) => s.status == ReportsStatus.loading),
        predicate<ReportsState>((s) => s.status == ReportsStatus.loaded),
      ],
    );
  });
}
