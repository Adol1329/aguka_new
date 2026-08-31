import 'package:bloc_test/bloc_test.dart';
import 'package:dartz/dartz.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/register_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/logout_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/check_auth_status_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/onboarding_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';

@GenerateMocks([
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
  CheckAuthStatusUseCase,
  OnboardingUseCase,
  AuthRepository,
])
import 'auth_role_and_token_test.mocks.dart';

const _adminUser = UserEntity(
  id: 'user-admin-001',
  phone: '+250788000099',
  fullName: 'Admin User',
  role: 'admin',
  language: 'en',
  isActive: true,
  isApproved: true,
);

const _superAdminUser = UserEntity(
  id: 'user-superadmin-001',
  phone: '+250788000098',
  fullName: 'Super Admin User',
  role: 'super_admin',
  language: 'en',
  isActive: true,
  isApproved: true,
);

const _farmerUser = UserEntity(
  id: 'user-farmer-001',
  phone: '+250788000001',
  fullName: 'Amina Uwase',
  role: 'farmer',
  language: 'en',
  isActive: true,
  isApproved: true,
);

AuthBloc buildBloc({
  required MockLoginUseCase loginUseCase,
  required MockRegisterUseCase registerUseCase,
  required MockLogoutUseCase logoutUseCase,
  required MockGetCurrentUserUseCase getCurrentUserUseCase,
  required MockCheckAuthStatusUseCase checkAuthStatusUseCase,
  required MockOnboardingUseCase onboardingUseCase,
  required MockAuthRepository authRepository,
}) =>
    AuthBloc(
      loginUseCase: loginUseCase,
      registerUseCase: registerUseCase,
      logoutUseCase: logoutUseCase,
      getCurrentUserUseCase: getCurrentUserUseCase,
      checkAuthStatusUseCase: checkAuthStatusUseCase,
      onboardingUseCase: onboardingUseCase,
      authRepository: authRepository,
    );

// ---------------------------------------------------------------------------
// Bug 1 — Admin/Super Admin must not be allowed on mobile
// ---------------------------------------------------------------------------
void main() {
  group('Bug 1 — Admin/Super Admin role check', () {
    late MockLoginUseCase mockLoginUseCase;
    late MockRegisterUseCase mockRegisterUseCase;
    late MockLogoutUseCase mockLogoutUseCase;
    late MockGetCurrentUserUseCase mockGetCurrentUserUseCase;
    late MockCheckAuthStatusUseCase mockCheckAuthStatusUseCase;
    late MockOnboardingUseCase mockOnboardingUseCase;
    late MockAuthRepository mockAuthRepository;

    setUp(() {
      mockLoginUseCase = MockLoginUseCase();
      mockRegisterUseCase = MockRegisterUseCase();
      mockLogoutUseCase = MockLogoutUseCase();
      mockGetCurrentUserUseCase = MockGetCurrentUserUseCase();
      mockCheckAuthStatusUseCase = MockCheckAuthStatusUseCase();
      mockOnboardingUseCase = MockOnboardingUseCase();
      mockAuthRepository = MockAuthRepository();
    });

    group('AuthLoginRequested', () {
      blocTest<AuthBloc, AuthState>(
        'admin login → emits AuthUnsupportedRole, no dashboard, no crash',
        build: () => buildBloc(
          loginUseCase: mockLoginUseCase,
          registerUseCase: mockRegisterUseCase,
          logoutUseCase: mockLogoutUseCase,
          getCurrentUserUseCase: mockGetCurrentUserUseCase,
          checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
          onboardingUseCase: mockOnboardingUseCase,
          authRepository: mockAuthRepository,
        ),
        setUp: () {
          when(mockLoginUseCase(any))
              .thenAnswer((_) async => const Right(_adminUser));
          when(mockAuthRepository.clearLocalSession())
              .thenAnswer((_) async => const Right(null));
        },
        act: (bloc) => bloc.add(const AuthLoginRequested(
          phone: '+250788000099',
          password: 'admin123',
        )),
        expect: () => [
          isA<AuthLoading>(),
          isA<AuthUnsupportedRole>(),
        ],
        verify: (bloc) {
          final state = bloc.state as AuthUnsupportedRole;
          expect(state.role, equals('admin'));
        },
      );

      blocTest<AuthBloc, AuthState>(
        'super_admin login → emits AuthUnsupportedRole, no dashboard, no crash',
        build: () => buildBloc(
          loginUseCase: mockLoginUseCase,
          registerUseCase: mockRegisterUseCase,
          logoutUseCase: mockLogoutUseCase,
          getCurrentUserUseCase: mockGetCurrentUserUseCase,
          checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
          onboardingUseCase: mockOnboardingUseCase,
          authRepository: mockAuthRepository,
        ),
        setUp: () {
          when(mockLoginUseCase(any))
              .thenAnswer((_) async => const Right(_superAdminUser));
          when(mockAuthRepository.clearLocalSession())
              .thenAnswer((_) async => const Right(null));
        },
        act: (bloc) => bloc.add(const AuthLoginRequested(
          phone: '+250788000098',
          password: 'superadmin123',
        )),
        expect: () => [
          isA<AuthLoading>(),
          isA<AuthUnsupportedRole>(),
        ],
        verify: (bloc) {
          final state = bloc.state as AuthUnsupportedRole;
          expect(state.role, equals('super_admin'));
        },
      );

      blocTest<AuthBloc, AuthState>(
        'farmer login (valid role) → emits AuthAuthenticated, no regression',
        build: () => buildBloc(
          loginUseCase: mockLoginUseCase,
          registerUseCase: mockRegisterUseCase,
          logoutUseCase: mockLogoutUseCase,
          getCurrentUserUseCase: mockGetCurrentUserUseCase,
          checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
          onboardingUseCase: mockOnboardingUseCase,
          authRepository: mockAuthRepository,
        ),
        setUp: () {
          when(mockLoginUseCase(any))
              .thenAnswer((_) async => const Right(_farmerUser));
        },
        act: (bloc) => bloc.add(const AuthLoginRequested(
          phone: '+250788000001',
          password: 'password123',
        )),
        expect: () => [
          isA<AuthLoading>(),
          isA<AuthAuthenticated>(),
        ],
      );
    });

    group('AuthCheckRequested (app restart with persisted session)', () {
      blocTest<AuthBloc, AuthState>(
        'admin session restored → emits AuthUnsupportedRole, clears session',
        build: () => buildBloc(
          loginUseCase: mockLoginUseCase,
          registerUseCase: mockRegisterUseCase,
          logoutUseCase: mockLogoutUseCase,
          getCurrentUserUseCase: mockGetCurrentUserUseCase,
          checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
          onboardingUseCase: mockOnboardingUseCase,
          authRepository: mockAuthRepository,
        ),
        setUp: () {
          when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => true);
          when(mockGetCurrentUserUseCase(NoParams()))
              .thenAnswer((_) async => const Right(_adminUser));
          when(mockAuthRepository.clearLocalSession())
              .thenAnswer((_) async => const Right(null));
        },
        act: (bloc) => bloc.add(AuthCheckRequested()),
        expect: () => [
          isA<AuthLoading>(),
          isA<AuthUnsupportedRole>(),
        ],
        verify: (_) {
          verify(mockAuthRepository.clearLocalSession()).called(1);
        },
      );

      blocTest<AuthBloc, AuthState>(
        'super_admin session restored → emits AuthUnsupportedRole, clears session',
        build: () => buildBloc(
          loginUseCase: mockLoginUseCase,
          registerUseCase: mockRegisterUseCase,
          logoutUseCase: mockLogoutUseCase,
          getCurrentUserUseCase: mockGetCurrentUserUseCase,
          checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
          onboardingUseCase: mockOnboardingUseCase,
          authRepository: mockAuthRepository,
        ),
        setUp: () {
          when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => true);
          when(mockGetCurrentUserUseCase(NoParams()))
              .thenAnswer((_) async => const Right(_superAdminUser));
          when(mockAuthRepository.clearLocalSession())
              .thenAnswer((_) async => const Right(null));
        },
        act: (bloc) => bloc.add(AuthCheckRequested()),
        expect: () => [
          isA<AuthLoading>(),
          isA<AuthUnsupportedRole>(),
        ],
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Bug 2 — Token expiry / 401 errors
  // ---------------------------------------------------------------------------
  group('Bug 2 — Token expiry & 401 handling', () {
    late MockLoginUseCase mockLoginUseCase;
    late MockRegisterUseCase mockRegisterUseCase;
    late MockLogoutUseCase mockLogoutUseCase;
    late MockGetCurrentUserUseCase mockGetCurrentUserUseCase;
    late MockCheckAuthStatusUseCase mockCheckAuthStatusUseCase;
    late MockOnboardingUseCase mockOnboardingUseCase;
    late MockAuthRepository mockAuthRepository;

    setUp(() {
      mockLoginUseCase = MockLoginUseCase();
      mockRegisterUseCase = MockRegisterUseCase();
      mockLogoutUseCase = MockLogoutUseCase();
      mockGetCurrentUserUseCase = MockGetCurrentUserUseCase();
      mockCheckAuthStatusUseCase = MockCheckAuthStatusUseCase();
      mockOnboardingUseCase = MockOnboardingUseCase();
      mockAuthRepository = MockAuthRepository();
    });

    blocTest<AuthBloc, AuthState>(
      '401 on /users/me + refresh succeeds → retry succeeds → AuthAuthenticated',
      build: () => buildBloc(
        loginUseCase: mockLoginUseCase,
        registerUseCase: mockRegisterUseCase,
        logoutUseCase: mockLogoutUseCase,
        getCurrentUserUseCase: mockGetCurrentUserUseCase,
        checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
        onboardingUseCase: mockOnboardingUseCase,
        authRepository: mockAuthRepository,
      ),
      setUp: () {
        var callCount = 0;
        when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => true);
        when(mockGetCurrentUserUseCase(NoParams())).thenAnswer((_) async {
          callCount++;
          if (callCount == 1) {
            return Left(ServerFailure('Token expired'));
          }
          return const Right(_farmerUser);
        });
        when(mockAuthRepository.refreshToken())
            .thenAnswer((_) async => const Right(null));
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthAuthenticated>(),
      ],
      verify: (_) {
        verify(mockAuthRepository.refreshToken()).called(1);
        verifyNever(mockAuthRepository.clearLocalSession());
        verifyNever(mockLogoutUseCase(NoParams()));
      },
    );

    blocTest<AuthBloc, AuthState>(
      '401 on /users/me + refresh fails → clearLocalSession, no logout API call',
      build: () => buildBloc(
        loginUseCase: mockLoginUseCase,
        registerUseCase: mockRegisterUseCase,
        logoutUseCase: mockLogoutUseCase,
        getCurrentUserUseCase: mockGetCurrentUserUseCase,
        checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
        onboardingUseCase: mockOnboardingUseCase,
        authRepository: mockAuthRepository,
      ),
      setUp: () {
        when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => true);
        when(mockGetCurrentUserUseCase(NoParams()))
            .thenAnswer((_) async => Left(ServerFailure('Token expired')));
        when(mockAuthRepository.refreshToken())
            .thenAnswer((_) async => Left(ServerFailure('Refresh failed')));
        when(mockAuthRepository.clearLocalSession())
            .thenAnswer((_) async => const Right(null));
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthUnauthenticated>(),
      ],
      verify: (_) {
        verify(mockAuthRepository.refreshToken()).called(1);
        verify(mockAuthRepository.clearLocalSession()).called(1);
        verifyNever(mockLogoutUseCase(NoParams()));
      },
    );

    blocTest<AuthBloc, AuthState>(
      '401 on /users/me + no refresh token → clearLocalSession, no logout API call',
      build: () => buildBloc(
        loginUseCase: mockLoginUseCase,
        registerUseCase: mockRegisterUseCase,
        logoutUseCase: mockLogoutUseCase,
        getCurrentUserUseCase: mockGetCurrentUserUseCase,
        checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
        onboardingUseCase: mockOnboardingUseCase,
        authRepository: mockAuthRepository,
      ),
      setUp: () {
        when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => true);
        when(mockGetCurrentUserUseCase(NoParams()))
            .thenAnswer((_) async => Left(ServerFailure('Token expired')));
        when(mockAuthRepository.refreshToken())
            .thenAnswer((_) async => Left(ServerFailure('No refresh token')));
        when(mockAuthRepository.clearLocalSession())
            .thenAnswer((_) async => const Right(null));
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthUnauthenticated>(),
      ],
      verify: (_) {
        verify(mockAuthRepository.refreshToken()).called(1);
        verify(mockAuthRepository.clearLocalSession()).called(1);
        verifyNever(mockLogoutUseCase(NoParams()));
      },
    );
  });
}
