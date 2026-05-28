import 'package:flutter_test/flutter_test.dart';
import 'package:aguka_mobile/features/notifications/data/models/notification_model.dart';
import '../../helpers/test_fixtures.dart';

void main() {
  group('NotificationModel', () {
    test('fromJson parses all fields correctly', () {
      final json = {
        'id': 'notif-abc',
        'title': 'Irrigation Alert',
        'message': 'Zone A needs water.',
        'type': 'warning',
        'priority': 'high',
        'createdAt': '2026-05-15T08:00:00.000Z',
        'readAt': null,
      };

      final model = NotificationModel.fromJson(json);

      expect(model.id, equals('notif-abc'));
      expect(model.title, equals('Irrigation Alert'));
      expect(model.type, equals('warning'));
      expect(model.priority, equals('high'));
      expect(model.isRead, isFalse);
      expect(model.createdAt, isA<DateTime>());
    });

    test('isRead returns true when readAt is not null', () {
      final notif = TestFixtures.notification(isRead: true);
      expect(notif.isRead, isTrue);
    });

    test('isRead returns false when readAt is null', () {
      final notif = TestFixtures.notification(isRead: false);
      expect(notif.isRead, isFalse);
    });

    test('falls back to empty string for missing id', () {
      final model = NotificationModel.fromJson({
        'title': 'Test',
        'message': 'Msg',
        'type': 'info',
        'priority': 'low',
        'createdAt': '2026-05-15T08:00:00.000Z',
      });
      expect(model.id, equals(''));
    });

    test('priority field is preserved exactly', () {
      for (final priority in ['low', 'normal', 'high', 'critical']) {
        final model = NotificationModel.fromJson({
          'id': '1',
          'title': 'Test',
          'message': 'Msg',
          'type': 'info',
          'priority': priority,
          'createdAt': '2026-05-15T08:00:00.000Z',
        });
        expect(model.priority, equals(priority));
      }
    });
  });
}
