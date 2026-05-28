import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/logout_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/check_auth_status_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import '../../helpers/test_fixtures.dart';

@GenerateMocks([AuthRepository])
import 'auth_usecases_test.mocks.dart';

void main() {
  late MockAuthRepository mockRepo;
  late LoginUseCase loginUseCase;
  late LogoutUseCase logoutUseCase;
  late CheckAuthStatusUseCase checkAuthStatusUseCase;
  late GetCurrentUserUseCase getCurrentUserUseCase;

  setUp(() {
    mockRepo = MockAuthRepository();
    loginUseCase = LoginUseCase(mockRepo);
    logoutUseCase = LogoutUseCase(mockRepo);
    checkAuthStatusUseCase = CheckAuthStatusUseCase(mockRepo);
    getCurrentUserUseCase = GetCurrentUserUseCase(mockRepo);
  });

  // ---------------------------------------------------------------------------
  // LoginUseCase
  // ---------------------------------------------------------------------------
  group('LoginUseCase', () {
    const params = LoginParams(phone: '+250788000001', password: 'password123');

    test('returns UserEntity on successful login', () async {
      when(mockRepo.login(phone: params.phone, password: params.password))
          .thenAnswer((_) async => const Right(TestFixtures.farmerUser));

      final result = await loginUseCase(params);

      expect(result, equals(const Right(TestFixtures.farmerUser)));
      verify(mockRepo.login(phone: params.phone, password: params.password)).called(1);
    });

    test('returns ServerFailure when credentials are wrong', () async {
      when(mockRepo.login(phone: params.phone, password: params.password))
          .thenAnswer((_) async => Left(ServerFailure('Invalid credentials')));

      final result = await loginUseCase(params);

      expect(result.isLeft(), isTrue);
      result.fold(
        (failure) => expect(failure.message, equals('Invalid credentials')),
        (_) => fail('Expected failure'),
      );
    });

    test('returns NetworkFailure when offline', () async {
      when(mockRepo.login(phone: params.phone, password: params.password))
          .thenAnswer((_) async => Left(NetworkFailure('No internet connection')));

      final result = await loginUseCase(params);

      expect(result.isLeft(), isTrue);
      result.fold(
        (failure) => expect(failure, isA<NetworkFailure>()),
        (_) => fail('Expected failure'),
      );
    });
  });

  // ---------------------------------------------------------------------------
  // LogoutUseCase
  // ---------------------------------------------------------------------------
  group('LogoutUseCase', () {
    test('calls repository logout and returns Right(null)', () async {
      when(mockRepo.logout())
          .thenAnswer((_) async => const Right(null));

      final result = await logoutUseCase(NoParams());

      expect(result.isRight(), isTrue);
      verify(mockRepo.logout()).called(1);
    });

    test('propagates failure if logout API fails', () async {
      when(mockRepo.logout())
          .thenAnswer((_) async => Left(ServerFailure('Server error')));

      final result = await logoutUseCase(NoParams());

      expect(result.isLeft(), isTrue);
    });
  });

  // ---------------------------------------------------------------------------
  // CheckAuthStatusUseCase
  // ---------------------------------------------------------------------------
  group('CheckAuthStatusUseCase', () {
    test('returns true when token is present', () async {
      when(mockRepo.isAuthenticated()).thenAnswer((_) async => true);

      final result = await checkAuthStatusUseCase();

      expect(result, isTrue);
      verify(mockRepo.isAuthenticated()).called(1);
    });

    test('returns false when no token is stored', () async {
      when(mockRepo.isAuthenticated()).thenAnswer((_) async => false);

      final result = await checkAuthStatusUseCase();

      expect(result, isFalse);
    });
  });

  // ---------------------------------------------------------------------------
  // GetCurrentUserUseCase
  // ---------------------------------------------------------------------------
  group('GetCurrentUserUseCase', () {
    test('returns authenticated user from repository', () async {
      when(mockRepo.getCurrentUser())
          .thenAnswer((_) async => const Right(TestFixtures.farmerUser));

      final result = await getCurrentUserUseCase(NoParams());

      expect(result.isRight(), isTrue);
      result.fold(
        (_) => fail('Expected success'),
        (user) => expect(user.id, equals('user-farmer-001')),
      );
    });

    test('returns failure when /users/me returns 401', () async {
      when(mockRepo.getCurrentUser())
          .thenAnswer((_) async => Left(ServerFailure('Unauthorized')));

      final result = await getCurrentUserUseCase(NoParams());

      expect(result.isLeft(), isTrue);
    });
  });
}
