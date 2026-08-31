import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/core/utils/validators.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/register_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/logout_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/check_auth_status_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/onboarding_usecase.dart';

import 'auth_event.dart';
import 'auth_state.dart';

const _unsupportedRoles = ['admin', 'super_admin'];

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final LogoutUseCase _logoutUseCase;
  final GetCurrentUserUseCase _getCurrentUserUseCase;
  final CheckAuthStatusUseCase _checkAuthStatusUseCase;
  final OnboardingUseCase _onboardingUseCase;
  final AuthRepository _authRepository;

  AuthBloc({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required LogoutUseCase logoutUseCase,
    required GetCurrentUserUseCase getCurrentUserUseCase,
    required CheckAuthStatusUseCase checkAuthStatusUseCase,
    required OnboardingUseCase onboardingUseCase,
    required AuthRepository authRepository,
  })  : _loginUseCase = loginUseCase,
        _registerUseCase = registerUseCase,
        _logoutUseCase = logoutUseCase,
        _getCurrentUserUseCase = getCurrentUserUseCase,
        _checkAuthStatusUseCase = checkAuthStatusUseCase,
        _onboardingUseCase = onboardingUseCase,
        _authRepository = authRepository,
        super(AuthInitial()) {
    on<AuthCheckRequested>(_onCheckAuth);
    on<AuthLoginRequested>(_onLogin);
    on<AuthRegisterRequested>(_onRegister);
    on<AuthOnboardingRequested>(_onOnboarding);
    on<AuthLogoutRequested>(_onLogout);
  }

  Future<void> _onCheckAuth(AuthCheckRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final isAuthenticated = await _checkAuthStatusUseCase();
    if (!isAuthenticated) {
      emit(AuthUnauthenticated());
      return;
    }

    // Step 1: try fetching the current user with the stored access token
    final userEither = await _getCurrentUserUseCase(NoParams());
    UserEntity? user;

    await userEither.fold(
      (failure) async {
        // Step 2: access token expired or invalid — try silent refresh
        final refreshResult = await _authRepository.refreshToken();
        await refreshResult.fold(
          (refreshFailure) async {
            // Step 3a: refresh failed — clear local, no logout API call, route to login
            await _authRepository.clearLocalSession();
            emit(AuthUnauthenticated());
          },
          (_) async {
            // Step 3b: refresh succeeded — retry getCurrentUser
            final retryEither = await _getCurrentUserUseCase(NoParams());
            await retryEither.fold(
              (retryFailure) async {
                await _authRepository.clearLocalSession();
                emit(AuthUnauthenticated());
              },
              (retryUser) async {
                user = retryUser;
              },
            );
          },
        );
      },
      (fetchedUser) async {
        user = fetchedUser;
      },
    );

    if (user == null) return;

    if (_unsupportedRoles.contains(user!.role)) {
      await _authRepository.clearLocalSession();
      emit(AuthUnsupportedRole(role: user!.role));
      return;
    }

    if (!user!.isApproved) {
      emit(AuthPendingReview(user: user!));
    } else {
      emit(AuthAuthenticated(user: user!));
    }
  }

  Future<void> _onLogin(AuthLoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final normalizedPhone = Validators.normalizePhone(event.phone);
    final result = await _loginUseCase(LoginParams(phone: normalizedPhone, password: event.password));

    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (user) {
        if (_unsupportedRoles.contains(user.role)) {
          emit(AuthUnsupportedRole(role: user.role));
        } else if (!user.isApproved) {
          emit(AuthPendingReview(user: user));
        } else {
          emit(AuthAuthenticated(user: user));
        }
      },
    );
  }

  Future<void> _onRegister(AuthRegisterRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final normalizedPhone = Validators.normalizePhone(event.phone);
    final result = await _registerUseCase(RegisterParams(
      phone: normalizedPhone,
      password: event.password,
      fullName: event.fullName,
      role: event.role,
      email: event.email,
    ));

    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (user) {
        if (_unsupportedRoles.contains(user.role)) {
          emit(AuthUnsupportedRole(role: user.role));
        } else if (!user.isApproved) {
          emit(AuthPendingReview(user: user));
        } else {
          emit(AuthAuthenticated(user: user));
        }
      },
    );
  }

  Future<void> _onOnboarding(AuthOnboardingRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final result = await _onboardingUseCase(OnboardingParams(
      role: event.role,
      data: event.data,
    ));

    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (user) {
        if (_unsupportedRoles.contains(user.role)) {
          emit(AuthUnsupportedRole(role: user.role));
        } else {
          emit(AuthAuthenticated(user: user));
        }
      },
    );
  }

  Future<void> _onLogout(AuthLogoutRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    await _logoutUseCase(NoParams());
    emit(AuthUnauthenticated());
  }
}
