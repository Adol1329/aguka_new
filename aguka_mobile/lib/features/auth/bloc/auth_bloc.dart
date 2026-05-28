import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/usecases/usecase.dart';
import 'package:aguka_mobile/core/utils/validators.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/login_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/register_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/logout_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/get_current_user_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/check_auth_status_usecase.dart';
import 'package:aguka_mobile/features/auth/domain/usecases/onboarding_usecase.dart';

import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUseCase _loginUseCase;
  final RegisterUseCase _registerUseCase;
  final LogoutUseCase _logoutUseCase;
  final GetCurrentUserUseCase _getCurrentUserUseCase;
  final CheckAuthStatusUseCase _checkAuthStatusUseCase;
  final OnboardingUseCase _onboardingUseCase;

  AuthBloc({
    required LoginUseCase loginUseCase,
    required RegisterUseCase registerUseCase,
    required LogoutUseCase logoutUseCase,
    required GetCurrentUserUseCase getCurrentUserUseCase,
    required CheckAuthStatusUseCase checkAuthStatusUseCase,
    required OnboardingUseCase onboardingUseCase,
  })  : _loginUseCase = loginUseCase,
        _registerUseCase = registerUseCase,
        _logoutUseCase = logoutUseCase,
        _getCurrentUserUseCase = getCurrentUserUseCase,
        _checkAuthStatusUseCase = checkAuthStatusUseCase,
        _onboardingUseCase = onboardingUseCase,
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
    if (isAuthenticated) {
      final userEither = await _getCurrentUserUseCase(NoParams());
      await userEither.fold(
        (failure) async {
          await _logoutUseCase(NoParams());
          emit(AuthUnauthenticated());
        },
        (user) async {
          if (!user.isApproved) {
            emit(AuthPendingReview(user: user));
          } else {
            emit(AuthAuthenticated(user: user));
          }
        },
      );
    } else {
      emit(AuthUnauthenticated());
    }
  }

  Future<void> _onLogin(AuthLoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final normalizedPhone = Validators.normalizePhone(event.phone);
    final result = await _loginUseCase(LoginParams(phone: normalizedPhone, password: event.password));
    
    result.fold(
      (failure) => emit(AuthError(message: failure.message)),
      (user) {
        if (!user.isApproved) {
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
      (user) => emit(AuthRegistered(user: user)),
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
      (user) => emit(AuthAuthenticated(user: user)),
    );
  }

  Future<void> _onLogout(AuthLogoutRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    await _logoutUseCase(NoParams());
    emit(AuthUnauthenticated());
  }
}
