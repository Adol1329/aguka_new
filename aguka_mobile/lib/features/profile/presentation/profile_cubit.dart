import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';

enum ProfileStatus { initial, loading, loaded, saving, error }

class ProfileState extends Equatable {
  final ProfileStatus status;
  final UserEntity? profile;
  final bool isEditing;
  final String? errorMessage;
  final bool saveSuccess;

  const ProfileState({
    this.status = ProfileStatus.initial,
    this.profile,
    this.isEditing = false,
    this.errorMessage,
    this.saveSuccess = false,
  });

  ProfileState copyWith({
    ProfileStatus? status,
    UserEntity? profile,
    bool? isEditing,
    String? errorMessage,
    bool? saveSuccess,
  }) {
    return ProfileState(
      status: status ?? this.status,
      profile: profile ?? this.profile,
      isEditing: isEditing ?? this.isEditing,
      errorMessage: errorMessage,
      saveSuccess: saveSuccess ?? false,
    );
  }

  @override
  List<Object?> get props => [
        status,
        profile,
        isEditing,
        errorMessage,
        saveSuccess,
      ];
}

class ProfileCubit extends Cubit<ProfileState> {
  final AuthRepository repository;

  ProfileCubit({required this.repository}) : super(const ProfileState());

  Future<void> loadProfile() async {
    emit(state.copyWith(status: ProfileStatus.loading));
    final result = await repository.getProfile();
    result.fold(
      (failure) => emit(state.copyWith(
        status: ProfileStatus.error,
        errorMessage: failure.message,
      )),
      (profile) => emit(state.copyWith(
        status: ProfileStatus.loaded,
        profile: profile,
      )),
    );
  }

  void startEditing() {
    emit(state.copyWith(isEditing: true));
  }

  void cancelEditing() {
    emit(state.copyWith(isEditing: false));
  }

  Future<void> saveProfile({
    required String firstName,
    required String lastName,
    required String district,
    required String sector,
    required String cell,
    required String village,
    String? farmSize,
    String? primaryCrop,
  }) async {
    emit(state.copyWith(status: ProfileStatus.saving));
    final result = await repository.updateProfile(
      firstName: firstName,
      lastName: lastName,
      district: district,
      sector: sector,
      cell: cell,
      village: village,
      farmSize: farmSize,
      primaryCrop: primaryCrop,
    );
    result.fold(
      (failure) => emit(state.copyWith(
        status: ProfileStatus.loaded,
        errorMessage: failure.message,
      )),
      (profile) => emit(state.copyWith(
        status: ProfileStatus.loaded,
        profile: profile,
        isEditing: false,
        saveSuccess: true,
      )),
    );
  }
}
