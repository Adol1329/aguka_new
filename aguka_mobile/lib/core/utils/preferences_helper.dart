import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';

class PreferencesHelper {
  static const String _authTokenKey = 'auth_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userIdKey = 'user_id';
  static const String _userRoleKey = 'user_role';
  static const String _languageKey = 'language';

  final SharedPreferences _prefs;
  final FlutterSecureStorage _secureStorage;
  String? _authToken;
  String? _refreshToken;
  String? _userId;
  String? _userRole;

  PreferencesHelper(
    this._prefs, {
    FlutterSecureStorage secureStorage = const FlutterSecureStorage(),
  }) : _secureStorage = secureStorage;

  Future<void> loadSecureValues() async {
    _authToken = await _secureStorage.read(key: _authTokenKey);
    _refreshToken = await _secureStorage.read(key: _refreshTokenKey);
    _userId = await _secureStorage.read(key: _userIdKey);
    _userRole = await _secureStorage.read(key: _userRoleKey);
  }

  // Auth Token
  String? get authToken => _authToken;
  Future<bool> setAuthToken(String token) async {
    _authToken = token;
    await _secureStorage.write(key: _authTokenKey, value: token);
    return true;
  }

  // Refresh Token
  String? get refreshToken => _refreshToken;
  Future<bool> setRefreshToken(String token) async {
    _refreshToken = token;
    await _secureStorage.write(key: _refreshTokenKey, value: token);
    return true;
  }

  // User ID
  String? get userId => _userId;
  Future<bool> setUserId(String id) async {
    _userId = id;
    await _secureStorage.write(key: _userIdKey, value: id);
    return true;
  }

  // User Role
  String? get userRole => _userRole;
  Future<bool> setUserRole(String role) async {
    _userRole = role;
    await _secureStorage.write(key: _userRoleKey, value: role);
    return true;
  }

  // Language
  String get language => _prefs.getString(_languageKey) ?? 'en';
  Future<bool> setLanguage(String lang) => _prefs.setString(_languageKey, lang);

  // Check if authenticated
  bool get isAuthenticated => authToken != null && authToken!.isNotEmpty;

  // Clear all auth data
  Future<bool> clearAuth() async {
    _authToken = null;
    _refreshToken = null;
    _userId = null;
    _userRole = null;
    await _secureStorage.delete(key: _authTokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
    await _secureStorage.delete(key: _userIdKey);
    await _secureStorage.delete(key: _userRoleKey);
    return true;
  }
}
