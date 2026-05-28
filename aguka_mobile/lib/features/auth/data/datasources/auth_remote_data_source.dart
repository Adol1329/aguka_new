import 'package:dio/dio.dart';
import 'package:aguka_mobile/core/error/exceptions.dart';
import 'package:aguka_mobile/features/auth/data/models/user_model.dart';

/// Wraps both the authenticated user and the access token returned by the backend.
class LoginResponse {
  final UserModel user;
  final String token;
  final String? refreshToken;

  LoginResponse({required this.user, required this.token, this.refreshToken});
}

abstract class AuthRemoteDataSource {
  Future<LoginResponse> login({
    required String phone,
    required String password,
  });

  Future<UserModel> register({
    required String phone,
    required String password,
    required String fullName,
    required String role,
    String? email,
    String? language,
  });

  Future<UserModel> onboardFarmer(Map<String, dynamic> data);
  Future<UserModel> onboardOfficer(Map<String, dynamic> data);
  Future<UserModel> onboardCooperative(Map<String, dynamic> data);

  Future<UserModel> getCurrentUser();

  Future<UserModel> getProfile();

  Future<UserModel> updateProfile({
    required String firstName,
    required String lastName,
    required String district,
    required String sector,
    required String cell,
    required String village,
    String? farmSize,
    String? primaryCrop,
  });

  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio client;

  AuthRemoteDataSourceImpl(this.client);

  @override
  Future<LoginResponse> login({
    required String phone,
    required String password,
  }) async {
    final response = await client.post('/auth/login', data: {
      'phone': phone,
      'password': password,
    });

    if (response.statusCode == 200) {
      final data = response.data['data'] ?? response.data;
      final token = data['token'] as String? ?? data['accessToken'] as String? ?? '';
      final refreshToken = data['refreshToken'] as String?;
      final user = UserModel.fromJson(data['user'] ?? data);
      return LoginResponse(user: user, token: token, refreshToken: refreshToken);
    } else {
      throw ServerException('Login failed');
    }
  }

  @override
  Future<UserModel> register({
    required String phone,
    required String password,
    required String fullName,
    required String role,
    String? email,
    String? language,
  }) async {
    final Map<String, dynamic> data = {
      'phone': phone,
      'password': password,
      'fullName': fullName,
      'role': role.toLowerCase(),
      'email': email,
      'language': language,
    };

    final response = await client.post('/auth/register', data: data);

    if (response.statusCode == 201 || response.statusCode == 200) {
      final responseData = response.data['data'] ?? response.data;
      return UserModel.fromJson(responseData['user'] ?? responseData);
    } else {
      throw ServerException('Registration failed');
    }
  }

  @override
  Future<UserModel> onboardFarmer(Map<String, dynamic> data) async {
    final response = await client.post('/onboarding/farmer', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      final responseData = response.data['data'] ?? response.data;
      return UserModel.fromJson(responseData['user'] ?? responseData);
    } else {
      throw ServerException('Farmer onboarding failed');
    }
  }

  @override
  Future<UserModel> onboardOfficer(Map<String, dynamic> data) async {
    final response = await client.post('/onboarding/officer', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      final responseData = response.data['data'] ?? response.data;
      return UserModel.fromJson(responseData['user'] ?? responseData);
    } else {
      throw ServerException('Officer onboarding failed');
    }
  }

  @override
  Future<UserModel> onboardCooperative(Map<String, dynamic> data) async {
    final response = await client.post('/onboarding/cooperative', data: data);
    if (response.statusCode == 201 || response.statusCode == 200) {
      final responseData = response.data['data'] ?? response.data;
      return UserModel.fromJson(responseData['user'] ?? responseData);
    } else {
      throw ServerException('Cooperative onboarding failed');
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    final response = await client.get('/users/me');
    if (response.statusCode == 200) {
      final data = response.data['data'] ?? response.data;
      return UserModel.fromJson(data);
    } else {
      throw ServerException();
    }
  }

  @override
  Future<UserModel> getProfile() async {
    try {
      final response = await client.get('/farmer/profile');
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return UserModel.fromJson(data);
      }
      throw ServerException('Failed to load profile');
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to load profile'));
    }
  }

  @override
  Future<UserModel> updateProfile({
    required String firstName,
    required String lastName,
    required String district,
    required String sector,
    required String cell,
    required String village,
    String? farmSize,
    String? primaryCrop,
  }) async {
    try {
      final fullName = [firstName, lastName]
          .where((part) => part.trim().isNotEmpty)
          .join(' ')
          .trim();
      final response = await client.put('/farmer/profile', data: {
        'firstName': firstName,
        'lastName': lastName,
        'fullName': fullName,
        'district': district,
        'sector': sector,
        'cell': cell,
        'village': village,
        if (farmSize != null && farmSize.trim().isNotEmpty)
          'farmSizeHectares': double.tryParse(farmSize),
        if (primaryCrop != null && primaryCrop.trim().isNotEmpty)
          'primaryCrop': primaryCrop,
      });

      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return UserModel.fromJson(data);
      }
      throw ServerException('Failed to update profile');
    } on DioException catch (e) {
      throw ServerException(_errorMessage(e, 'Failed to update profile'));
    }
  }

  @override
  Future<void> logout() async {
    await client.post('/auth/logout');
  }

  String _errorMessage(DioException error, String fallback) {
    final data = error.response?.data;
    if (data is Map<String, dynamic>) {
      final errorValue = data['error'];
      if (errorValue is Map<String, dynamic>) {
        return errorValue['message']?.toString() ?? fallback;
      }
      if (errorValue is String) return errorValue;
      return data['message']?.toString() ?? fallback;
    }
    return error.message ?? fallback;
  }
}
