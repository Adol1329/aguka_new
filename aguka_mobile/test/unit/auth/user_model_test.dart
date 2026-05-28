import 'package:flutter_test/flutter_test.dart';
import 'package:aguka_mobile/features/auth/data/models/user_model.dart';
import '../../helpers/test_fixtures.dart';

void main() {
  group('UserModel', () {
    group('fromJson()', () {
      test('correctly parses a full user JSON payload', () {
        final json = TestFixtures.userJson();
        final model = UserModel.fromJson(json);

        expect(model.id, equals('user-farmer-001'));
        expect(model.phone, equals('+250788000001'));
        expect(model.fullName, equals('Amina Uwase'));
        expect(model.email, equals('amina@aguka.rw'));
        expect(model.role, equals('farmer'));
        expect(model.language, equals('en'));
        expect(model.isActive, isTrue);
        expect(model.cooperativeId, isNull);
      });

      test('falls back to safe defaults for missing fields', () {
        final model = UserModel.fromJson({});

        expect(model.id, equals(''));
        expect(model.phone, equals(''));
        expect(model.role, equals('farmer'));
        expect(model.language, equals('en'));
        expect(model.isActive, isTrue);
      });

      test('parses cooperativeId when present', () {
        final json = {...TestFixtures.userJson(), 'cooperativeId': 'coop-123'};
        final model = UserModel.fromJson(json);
        expect(model.cooperativeId, equals('coop-123'));
      });
    });

    group('toJson()', () {
      test('serializes model back to matching JSON', () {
        const model = TestFixtures.farmerUser;
        final json = model.toJson();

        expect(json['id'], equals('user-farmer-001'));
        expect(json['phone'], equals('+250788000001'));
        expect(json['role'], equals('farmer'));
        expect(json['isActive'], isTrue);
      });

      test('toJson → fromJson roundtrip produces identical entity', () {
        const original = TestFixtures.farmerUser;
        final roundtripped = UserModel.fromJson(original.toJson());
        expect(roundtripped, equals(original));
      });
    });

    group('fromEntity()', () {
      test('correctly converts a UserEntity to UserModel', () {
        const entity = TestFixtures.farmerUser;
        final model = UserModel.fromEntity(entity);

        expect(model.id, equals(entity.id));
        expect(model.phone, equals(entity.phone));
        expect(model.role, equals(entity.role));
      });
    });

    group('Equatable', () {
      test('two models with same props are equal', () {
        const a = TestFixtures.farmerUser;
        const b = TestFixtures.farmerUser;
        expect(a, equals(b));
      });

      test('models with different IDs are not equal', () {
        const a = TestFixtures.farmerUser;
        final b = UserModel.fromJson({...TestFixtures.userJson(), 'id': 'different-id'});
        expect(a, isNot(equals(b)));
      });
    });

    group('role semantics', () {
      test('farmer role is recognized', () {
        expect(TestFixtures.farmerUser.role, equals('farmer'));
      });

      test('extension officer role is recognized', () {
        expect(TestFixtures.extensionOfficerUser.role, equals('extension_officer'));
      });

      test('cooperative manager role is recognized', () {
        expect(TestFixtures.cooperativeManagerUser.role, equals('cooperative_manager'));
        expect(TestFixtures.cooperativeManagerUser.cooperativeId, isNotNull);
      });
    });
  });

  group('UserEntity', () {
    test('props list contains all identity fields', () {
      const entity = TestFixtures.farmerUser;
      expect(entity.props.length, equals(27));
    });
  });
}
