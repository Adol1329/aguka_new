import 'package:flutter_test/flutter_test.dart';
import 'package:aguka_mobile/features/irrigation/data/models/irrigation_status_model.dart';
import '../../helpers/test_fixtures.dart';

void main() {
  group('IrrigationStatusModel', () {
    test('isPumpActive: true when pump is running', () {
      expect(TestFixtures.irrigationActive.isPumpActive, isTrue);
    });

    test('isPumpActive: false when pump is off', () {
      expect(TestFixtures.irrigationInactive.isPumpActive, isFalse);
    });

    test('fromJson parses status fields correctly', () {
      final json = {
        'isPumpActive': true,
        'waterUsed': 220.5,
        'percentageSaved': 30.0,
        'lastTapTime': '2026-05-15T09:30:00.000Z',
      };

      final model = IrrigationStatusModel.fromJson(json);

      expect(model.isPumpActive, isTrue);
      expect(model.waterUsed, equals(220.5));
      expect(model.percentageSaved, equals(30.0));
      expect(model.lastTapTime, isNotNull);
    });

    test('fromJson handles missing optional fields gracefully', () {
      final model = IrrigationStatusModel.fromJson({});
      expect(model.isPumpActive, isFalse);
      expect(model.waterUsed, equals(0.0));
      expect(model.percentageSaved, equals(0.0));
      expect(model.lastTapTime, isNull);
    });

    test('water used is non-negative', () {
      expect(TestFixtures.irrigationActive.waterUsed, greaterThanOrEqualTo(0));
      expect(TestFixtures.irrigationInactive.waterUsed, greaterThanOrEqualTo(0));
    });

    test('percentage saved is within 0-100 range', () {
      expect(
        TestFixtures.irrigationActive.percentageSaved,
        inInclusiveRange(0, 100),
      );
    });
  });
}
