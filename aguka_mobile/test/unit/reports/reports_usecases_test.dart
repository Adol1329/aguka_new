import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/reports/domain/repositories/reports_repository.dart';
import 'package:aguka_mobile/features/reports/domain/usecases/get_report_analytics_usecase.dart';
import 'package:aguka_mobile/features/reports/data/models/report_analytics_model.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';

@GenerateMocks([ReportsRepository])
import 'reports_usecases_test.mocks.dart';

void main() {
  late MockReportsRepository mockRepo;
  late GetReportAnalyticsUseCase getAnalyticsUseCase;

  setUp(() {
    mockRepo = MockReportsRepository();
    getAnalyticsUseCase = GetReportAnalyticsUseCase(mockRepo);
  });

  group('GetReportAnalyticsUseCase', () {
    test('returns analytics entity on success', () async {
      final mockData = ReportAnalyticsModel.mock();
      when(mockRepo.getAnalytics())
          .thenAnswer((_) async => Right(mockData));

      final result = await getAnalyticsUseCase(NoParams());

      expect(result.isRight(), isTrue);
      result.fold(
        (_) => fail('Expected success'),
        (analytics) {
          expect(analytics.overview.score, greaterThan(0));
          expect(analytics.recommendations, isNotEmpty);
          expect(analytics.trends.soilMoisture, isNotEmpty);
        },
      );
    });

    test('returns ServerFailure when endpoint is unavailable', () async {
      when(mockRepo.getAnalytics())
          .thenAnswer((_) async => Left(ServerFailure('Endpoint not available')));

      final result = await getAnalyticsUseCase(NoParams());

      expect(result.isLeft(), isTrue);
    });

    test('analytics score is within 0–100 range', () async {
      final mockData = ReportAnalyticsModel.mock();
      when(mockRepo.getAnalytics())
          .thenAnswer((_) async => Right(mockData));

      final result = await getAnalyticsUseCase(NoParams());

      result.fold(
        (_) => fail('Expected success'),
        (analytics) {
          expect(analytics.overview.score, inInclusiveRange(0, 100));
          expect(analytics.overview.moistureStability, inInclusiveRange(0, 100));
          expect(analytics.overview.irrigationCompliance, inInclusiveRange(0, 100));
        },
      );
    });

    test('trend data has at least one data point', () async {
      final mockData = ReportAnalyticsModel.mock();
      when(mockRepo.getAnalytics())
          .thenAnswer((_) async => Right(mockData));

      final result = await getAnalyticsUseCase(NoParams());

      result.fold(
        (_) => fail('Expected success'),
        (analytics) => expect(analytics.trends.soilMoisture.length, greaterThan(0)),
      );
    });
  });
}
