import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/community/presentation/community_page.dart';
import 'package:aguka_mobile/features/profile/presentation/profile_page.dart';
import 'package:aguka_mobile/features/settings/presentation/settings_page.dart';
import 'package:aguka_mobile/features/support/presentation/help_page.dart';
import 'package:aguka_mobile/features/guidance/presentation/pages/guidance_page.dart';
import 'package:aguka_mobile/features/market/presentation/market_page.dart';
import 'package:aguka_mobile/features/reports/presentation/reports_page.dart';
import 'package:aguka_mobile/features/notifications/presentation/pages/notifications_page.dart';
import 'package:aguka_mobile/features/telemetry/presentation/soil_page.dart';
import 'package:aguka_mobile/features/telemetry/presentation/weather_page.dart';
import 'package:aguka_mobile/features/irrigation/presentation/pages/irrigation_page.dart';
import 'package:aguka_mobile/features/activities/presentation/pages/activities_page.dart';
import 'package:aguka_mobile/features/crops/presentation/pages/crops_page.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final authState = context.watch<AuthBloc>().state;
    final role = authState is AuthAuthenticated ? authState.user.role : null;

    return Drawer(
      child: Column(
        children: [
          _buildHeader(context),
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: _buildMenuItems(context, role),
            ),
          ),
          _buildFooter(context),
        ],
      ),
    );
  }

  List<Widget> _buildMenuItems(BuildContext context, String? role) {
    switch (role) {
      case 'farmer':
        return _farmerMenu(context);
      case 'extension_officer':
        return _officerMenu(context);
      case 'cooperative_manager':
        return _cooperativeMenu(context);
      default:
        return _farmerMenu(context);
    }
  }

  List<Widget> _farmerMenu(BuildContext context) {
    return [
      const _DrawerSectionHeader(label: 'My Farm'),
      _drawerItem(context, Icons.eco, 'My Crops', () => _navigate(context, const CropsPage())),
      _drawerItem(context, Icons.grass, 'soil.title'.tr(), () => _navigate(context, const SoilPage())),
      _drawerItem(context, Icons.cloud, 'weather.title'.tr(), () => _navigate(context, const WeatherPage())),
      _drawerItem(context, Icons.water_drop, 'irrigation.title'.tr(), () => _navigate(context, const IrrigationPage())),
      _drawerItem(context, Icons.assignment, 'activities.title'.tr(), () => _navigate(context, const ActivitiesPage())),
      _drawerItem(context, Icons.store, 'market.title'.tr(), () => _navigate(context, const MarketPage())),
      _drawerItem(context, Icons.assessment, 'reports.title'.tr(), () => _navigate(context, const ReportsPage())),
      _drawerItem(context, Icons.menu_book, 'guidance.title'.tr(), () => _navigate(context, const GuidancePage())),
      const Divider(),
      const _DrawerSectionHeader(label: 'Community'),
      _drawerItem(context, Icons.people, 'community.title'.tr(), () => _navigate(context, const CommunityPage())),
      _drawerItem(context, Icons.notifications, 'notifications.title'.tr(), () => _navigate(context, const NotificationsPage())),
      const Divider(),
      const _DrawerSectionHeader(label: 'Account'),
      _drawerItem(context, Icons.person, 'profile.title'.tr(), () => _navigate(context, const ProfilePage())),
      _drawerItem(context, Icons.settings, 'settings.title'.tr(), () => _navigate(context, const SettingsPage())),
      _drawerItem(context, Icons.language, 'language.title'.tr(), () => _showLanguageDialog(context)),
      _drawerItem(context, Icons.help_outline, 'help.title'.tr(), () => _navigate(context, const HelpPage())),
      _drawerItem(context, Icons.logout, 'logout'.tr(), () {
        Navigator.pop(context);
        context.read<AuthBloc>().add(AuthLogoutRequested());
      }),
    ];
  }

  List<Widget> _officerMenu(BuildContext context) {
    return [
      const _DrawerSectionHeader(label: 'Operations'),
      _drawerItem(context, Icons.grass, 'soil.title'.tr(), () => _navigate(context, const SoilPage())),
      _drawerItem(context, Icons.cloud, 'weather.title'.tr(), () => _navigate(context, const WeatherPage())),
      _drawerItem(context, Icons.water_drop, 'irrigation.title'.tr(), () => _navigate(context, const IrrigationPage())),
      _drawerItem(context, Icons.assessment, 'reports.title'.tr(), () => _navigate(context, const ReportsPage())),
      _drawerItem(context, Icons.menu_book, 'guidance.title'.tr(), () => _navigate(context, const GuidancePage())),
      const Divider(),
      const _DrawerSectionHeader(label: 'Community'),
      _drawerItem(context, Icons.people, 'community.title'.tr(), () => _navigate(context, const CommunityPage())),
      _drawerItem(context, Icons.notifications, 'notifications.title'.tr(), () => _navigate(context, const NotificationsPage())),
      const Divider(),
      const _DrawerSectionHeader(label: 'Account'),
      _drawerItem(context, Icons.person, 'profile.title'.tr(), () => _navigate(context, const ProfilePage())),
      _drawerItem(context, Icons.settings, 'settings.title'.tr(), () => _navigate(context, const SettingsPage())),
      _drawerItem(context, Icons.language, 'language.title'.tr(), () => _showLanguageDialog(context)),
      _drawerItem(context, Icons.help_outline, 'help.title'.tr(), () => _navigate(context, const HelpPage())),
      _drawerItem(context, Icons.logout, 'logout'.tr(), () {
        Navigator.pop(context);
        context.read<AuthBloc>().add(AuthLogoutRequested());
      }),
    ];
  }

  List<Widget> _cooperativeMenu(BuildContext context) {
    return [
      const _DrawerSectionHeader(label: 'Management'),
      _drawerItem(context, Icons.assessment, 'reports.title'.tr(), () => _navigate(context, const ReportsPage())),
      const Divider(),
      const _DrawerSectionHeader(label: 'Community'),
      _drawerItem(context, Icons.people, 'community.title'.tr(), () => _navigate(context, const CommunityPage())),
      _drawerItem(context, Icons.notifications, 'notifications.title'.tr(), () => _navigate(context, const NotificationsPage())),
      const Divider(),
      const _DrawerSectionHeader(label: 'Account'),
      _drawerItem(context, Icons.person, 'profile.title'.tr(), () => _navigate(context, const ProfilePage())),
      _drawerItem(context, Icons.settings, 'settings.title'.tr(), () => _navigate(context, const SettingsPage())),
      _drawerItem(context, Icons.language, 'language.title'.tr(), () => _showLanguageDialog(context)),
      _drawerItem(context, Icons.help_outline, 'help.title'.tr(), () => _navigate(context, const HelpPage())),
      _drawerItem(context, Icons.logout, 'logout'.tr(), () {
        Navigator.pop(context);
        context.read<AuthBloc>().add(AuthLogoutRequested());
      }),
    ];
  }

  void _navigate(BuildContext context, Widget page) {
    Navigator.pop(context);
    Navigator.push(context, MaterialPageRoute(builder: (context) => page));
  }

  void _showLanguageDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('language.select'.tr()),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _languageOption(context, 'English', const Locale('en')),
            _languageOption(context, 'Kinyarwanda', const Locale('rw')),
            _languageOption(context, 'Fran\u00e7ais', const Locale('fr')),
          ],
        ),
      ),
    );
  }

  Widget _languageOption(BuildContext context, String name, Locale locale) {
    final isSelected = context.locale == locale;
    return ListTile(
      title: Text(name),
      trailing: isSelected ? const Icon(Icons.check, color: Colors.green) : null,
      onTap: () {
        context.setLocale(locale);
        Navigator.pop(context);
      },
    );
  }

  Widget _buildHeader(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String name = 'Farmer';
        String phone = '';
        String? roleLabel;
        if (state is AuthAuthenticated) {
          name = state.user.fullName ?? 'Farmer';
          phone = state.user.phone;
          roleLabel = _roleLabel(state.user.role);
        }

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.only(top: 60, bottom: 20, left: 20, right: 20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Colors.green[800]!, Colors.green[600]!],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Semantics(
                label: 'User avatar',
                child: const CircleAvatar(
                  radius: 35,
                  backgroundColor: Colors.white24,
                  child: Icon(Icons.person, size: 40, color: Colors.white),
                ),
              ),
              const SizedBox(height: 15),
              Text(
                name,
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
              ),
              Text(
                phone,
                style: const TextStyle(color: Colors.white70, fontSize: 14),
              ),
              if (roleLabel != null) ...[
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    roleLabel,
                    style: const TextStyle(color: Colors.white, fontSize: 11),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  String? _roleLabel(String? role) {
    switch (role) {
      case 'farmer':
        return 'Farmer';
      case 'extension_officer':
        return 'Extension Officer';
      case 'cooperative_manager':
        return 'Cooperative Manager';
      case 'admin':
        return 'Admin';
      case 'super_admin':
        return 'Super Admin';
      default:
        return null;
    }
  }

  Widget _drawerItem(BuildContext context, IconData icon, String label, VoidCallback onTap) {
    return Semantics(
      label: label,
      child: ListTile(
        leading: Icon(icon, color: Colors.green[700]),
        title: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
        onTap: () {
          HapticFeedback.lightImpact();
          onTap();
        },
      ),
    );
  }

  Widget _buildFooter(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [
          const Divider(),
          Text(
            'Aguka Smart Farming v1.0.0',
            style: TextStyle(color: Colors.grey[600], fontSize: 12),
          ),
        ],
      ),
    );
  }
}

class _DrawerSectionHeader extends StatelessWidget {
  final String label;
  const _DrawerSectionHeader({required this.label});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.grey[600],
          letterSpacing: 1.0,
        ),
      ),
    );
  }
}
