import 'package:aguka_mobile/features/auth/data/models/user_model.dart';
import 'package:aguka_mobile/features/reports/data/models/report_analytics_model.dart';
import 'package:aguka_mobile/features/cooperatives/data/models/cooperative_model.dart';
import 'package:aguka_mobile/features/notifications/data/models/notification_model.dart';
import 'package:aguka_mobile/features/irrigation/data/models/irrigation_status_model.dart';
import 'package:aguka_mobile/features/telemetry/domain/entities/telemetry_data.dart';
import 'package:aguka_mobile/features/dashboard/domain/entities/dashboard_summary.dart';

/// Shared test fixtures used across all test files.
class TestFixtures {
  // ---------------------------------------------------------------------------
  // Users
  // ---------------------------------------------------------------------------
  static const farmerUser = UserModel(
    id: 'user-farmer-001',
    phone: '+250788000001',
    fullName: 'Amina Uwase',
    email: 'amina@aguka.rw',
    role: 'farmer',
    language: 'en',
    isActive: true,
  );

  static const extensionOfficerUser = UserModel(
    id: 'user-ext-001',
    phone: '+250788000002',
    fullName: 'Jean Claude',
    email: 'jc@aguka.rw',
    role: 'extension_officer',
    language: 'en',
    isActive: true,
  );

  static const cooperativeManagerUser = UserModel(
    id: 'user-mgr-001',
    phone: '+250788000003',
    fullName: 'Solange Ingabire',
    email: 'solange@aguka.rw',
    role: 'cooperative_manager',
    language: 'en',
    isActive: true,
    cooperativeId: 'coop-001',
  );

  // ---------------------------------------------------------------------------
  // Telemetry
  // ---------------------------------------------------------------------------
  static const npk = NPKEntity(n: 45.0, p: 30.0, k: 25.0);

  static final telemetry = TelemetryEntity(
    soilMoisture: 62.5,
    temperature: 24.0,
    ph: 6.5,
    npk: npk,
    weather: const WeatherEntity(
      tempC: 22.0,
      humidity: 65.0,
      rainfall: 0.0,
      condition: 'Partly Cloudy',
    ),
    timestamp: DateTime(2026, 5, 15, 9, 0),
  );

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  static DashboardSummary dashboardSummary() {
    return DashboardSummary(
      telemetry: telemetry,
      source: 'api',
      isCritical: false,
    );
  }

  static DashboardSummary criticalDashboardSummary() {
    return DashboardSummary(
      telemetry: TelemetryEntity(
        soilMoisture: 15.0,
        temperature: 35.0,
        ph: 5.5,
        npk: npk,
        weather: const WeatherEntity(
          tempC: 34.0,
          humidity: 20.0,
          rainfall: 0.0,
          condition: 'Sunny',
        ),
        timestamp: DateTime(2026, 5, 15),
      ),
      source: 'cache',
      isCritical: true,
    );
  }

  // ---------------------------------------------------------------------------
  // Irrigation
  // ---------------------------------------------------------------------------
  static const irrigationActive = IrrigationStatusModel(
    isPumpActive: true,
    waterUsed: 200.0,
    percentageSaved: 25.0,
  );

  static const irrigationInactive = IrrigationStatusModel(
    isPumpActive: false,
    waterUsed: 145.0,
    percentageSaved: 20.0,
  );

  // ---------------------------------------------------------------------------
  // Notifications
  // ---------------------------------------------------------------------------
  static NotificationModel notification({bool isRead = false}) {
    return NotificationModel(
      id: 'notif-001',
      title: 'Low Soil Moisture',
      message: 'Soil moisture in Zone B is below 20%.',
      type: 'warning',
      priority: 'high',
      createdAt: DateTime(2026, 5, 15, 8, 0),
      readAt: isRead ? DateTime(2026, 5, 15, 9, 0) : null,
    );
  }

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------
  static ReportAnalyticsModel reportAnalytics() {
    return ReportAnalyticsModel.mock();
  }

  // ---------------------------------------------------------------------------
  // Cooperatives
  // ---------------------------------------------------------------------------
  static CooperativeModel cooperative() => CooperativeModel.mock();
  static List<CooperativeMemberModel> cooperativeMembers() =>
      CooperativeMemberModel.mockList();

  // ---------------------------------------------------------------------------
  // JSON payloads (simulate backend responses)
  // ---------------------------------------------------------------------------
  static Map<String, dynamic> loginResponseJson() => {
        'data': {
          'token': 'test-jwt-token-abc123',
          'refreshToken': 'test-refresh-token-xyz',
          'user': {
            'id': 'user-farmer-001',
            'phone': '+250788000001',
            'fullName': 'Amina Uwase',
            'email': 'amina@aguka.rw',
            'role': 'farmer',
            'language': 'en',
            'isActive': true,
          },
        },
      };

  static Map<String, dynamic> userJson() => {
        'id': 'user-farmer-001',
        'phone': '+250788000001',
        'fullName': 'Amina Uwase',
        'email': 'amina@aguka.rw',
        'role': 'farmer',
        'language': 'en',
        'isActive': true,
      };
}
