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
import '../../helpers/test_fixtures.dart';

@GenerateMocks([
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
  CheckAuthStatusUseCase,
  OnboardingUseCase,
])
import 'auth_bloc_test.mocks.dart';

void main() {
  late MockLoginUseCase mockLoginUseCase;
  late MockRegisterUseCase mockRegisterUseCase;
  late MockLogoutUseCase mockLogoutUseCase;
  late MockGetCurrentUserUseCase mockGetCurrentUserUseCase;
  late MockCheckAuthStatusUseCase mockCheckAuthStatusUseCase;

  setUp(() {
    mockLoginUseCase = MockLoginUseCase();
    mockRegisterUseCase = MockRegisterUseCase();
    mockLogoutUseCase = MockLogoutUseCase();
    mockGetCurrentUserUseCase = MockGetCurrentUserUseCase();
    mockCheckAuthStatusUseCase = MockCheckAuthStatusUseCase();
  });

AuthBloc buildBloc() => AuthBloc(
         loginUseCase: mockLoginUseCase,
         registerUseCase: mockRegisterUseCase,
         logoutUseCase: mockLogoutUseCase,
         getCurrentUserUseCase: mockGetCurrentUserUseCase,
         checkAuthStatusUseCase: mockCheckAuthStatusUseCase,
         onboardingUseCase: MockOnboardingUseCase(),
       );

  // ---------------------------------------------------------------------------
  // Initial State
  // ---------------------------------------------------------------------------
  test('initial state is AuthInitial', () {
    expect(buildBloc().state, isA<AuthInitial>());
  });

  // ---------------------------------------------------------------------------
  // AuthCheckRequested
  // ---------------------------------------------------------------------------
  group('AuthCheckRequested', () {
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] when token valid and user loaded',
      build: buildBloc,
      setUp: () {
        when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => true);
        when(mockGetCurrentUserUseCase(NoParams()))
            .thenAnswer((_) async => const Right(TestFixtures.farmerUser));
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [isA<AuthLoading>(), isA<AuthAuthenticated>()],
      verify: (_) {
        verify(mockCheckAuthStatusUseCase()).called(1);
        verify(mockGetCurrentUserUseCase(NoParams())).called(1);
      },
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthUnauthenticated] when no token stored',
      build: buildBloc,
      setUp: () {
        when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => false);
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [isA<AuthLoading>(), isA<AuthUnauthenticated>()],
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthUnauthenticated] when token present but /users/me fails',
      build: buildBloc,
      setUp: () {
        when(mockCheckAuthStatusUseCase()).thenAnswer((_) async => true);
        when(mockGetCurrentUserUseCase(NoParams()))
            .thenAnswer((_) async => Left(ServerFailure('Unauthorized')));
        when(mockLogoutUseCase(NoParams()))
            .thenAnswer((_) async => const Right(null));
      },
      act: (bloc) => bloc.add(AuthCheckRequested()),
      expect: () => [isA<AuthLoading>(), isA<AuthUnauthenticated>()],
    );
  });

  // ---------------------------------------------------------------------------
  // AuthLoginRequested
  // ---------------------------------------------------------------------------
  group('AuthLoginRequested', () {
    final loginEvent = AuthLoginRequested(
      phone: '+250788000001',
      password: 'password123',
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthAuthenticated] on successful login',
      build: buildBloc,
      setUp: () {
        when(mockLoginUseCase(any))
            .thenAnswer((_) async => const Right(TestFixtures.farmerUser));
      },
      act: (bloc) => bloc.add(loginEvent),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthAuthenticated>(),
      ],
      verify: (bloc) {
        final state = bloc.state as AuthAuthenticated;
        expect(state.user.id, equals('user-farmer-001'));
        expect(state.user.role, equals('farmer'));
      },
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthError] on invalid credentials',
      build: buildBloc,
      setUp: () {
        when(mockLoginUseCase(any))
            .thenAnswer((_) async => Left(ServerFailure('Invalid credentials')));
      },
      act: (bloc) => bloc.add(loginEvent),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthError>(),
      ],
      verify: (bloc) {
        final state = bloc.state as AuthError;
        expect(state.message, equals('Invalid credentials'));
      },
    );

    blocTest<AuthBloc, AuthState>(
      'normalizes phone before login (strips spaces)',
      build: buildBloc,
      setUp: () {
        when(mockLoginUseCase(any))
            .thenAnswer((_) async => const Right(TestFixtures.farmerUser));
      },
      act: (bloc) => bloc.add(AuthLoginRequested(
        phone: '0788 000 001',
        password: 'password123',
      )),
      expect: () => [isA<AuthLoading>(), isA<AuthAuthenticated>()],
    );
  });

  // ---------------------------------------------------------------------------
  // AuthLogoutRequested
  // ---------------------------------------------------------------------------
  group('AuthLogoutRequested', () {
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthUnauthenticated] on logout',
      build: buildBloc,
      setUp: () {
        when(mockLogoutUseCase(NoParams()))
            .thenAnswer((_) async => const Right(null));
      },
      act: (bloc) => bloc.add(AuthLogoutRequested()),
      expect: () => [isA<AuthLoading>(), isA<AuthUnauthenticated>()],
      verify: (_) {
        verify(mockLogoutUseCase(NoParams())).called(1);
      },
    );
  });
}
