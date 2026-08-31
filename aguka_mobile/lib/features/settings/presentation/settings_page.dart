import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/core/theme/theme_cubit.dart';
import 'package:aguka_mobile/core/utils/preferences_helper.dart';
import 'package:aguka_mobile/core/error/failures.dart';
import 'package:aguka_mobile/features/auth/domain/repositories/auth_repository.dart';
import 'package:aguka_mobile/features/profile/presentation/profile_page.dart';
import 'package:aguka_mobile/injection_container.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';
import 'package:package_info_plus/package_info_plus.dart';

class SettingsPage extends StatefulWidget {
  const SettingsPage({Key? key}) : super(key: key);

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final _preferencesHelper = sl<PreferencesHelper>();
  final _authRepository = sl<AuthRepository>();
  late bool _pushNotificationsEnabled;
  late bool _smsAlertsEnabled;

  @override
  void initState() {
    super.initState();
    _pushNotificationsEnabled = _preferencesHelper.pushNotificationsEnabled;
    _smsAlertsEnabled = _preferencesHelper.smsAlertsEnabled;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AgukaAppBar(
        title: 'settings.title'.tr(),
        showFilter: false,
        showDrawer: false,
      ),
      body: ListView(
        children: [
          _buildSectionHeader('settings.account'.tr()),
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: Text('settings.edit_profile'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProfilePage()),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: Text('settings.change_password'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showChangePasswordDialog(context),
          ),
          const Divider(),
          _buildSectionHeader('settings.notifications'.tr()),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_active_outlined),
            title: Text('settings.push_notifications'.tr()),
            value: _pushNotificationsEnabled,
            onChanged: (val) async {
              setState(() => _pushNotificationsEnabled = val);
              await _preferencesHelper.setPushNotificationsEnabled(val);
            },
          ),
          SwitchListTile(
            secondary: const Icon(Icons.sms_outlined),
            title: Text('settings.sms_alerts'.tr()),
            value: _smsAlertsEnabled,
            onChanged: (val) async {
              setState(() => _smsAlertsEnabled = val);
              await _preferencesHelper.setSmsAlertsEnabled(val);
            },
          ),
          const Divider(),
          _buildSectionHeader('settings.app'.tr()),
          BlocBuilder<ThemeCubit, ThemeMode>(
            builder: (context, themeMode) => SwitchListTile(
              secondary: const Icon(Icons.dark_mode_outlined),
              title: Text('settings.dark_mode'.tr()),
              value: themeMode == ThemeMode.dark,
              onChanged: (val) => context.read<ThemeCubit>().setDarkMode(val),
            ),
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text('settings.about'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _showAboutDialog(context),
          ),
        ],
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final currentPasswordController = TextEditingController();
    final newPasswordController = TextEditingController();
    bool isSubmitting = false;
    String? errorText;

    showDialog(
      context: context,
      builder: (dialogContext) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: Text('settings.change_password'.tr()),
          content: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  controller: currentPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Current password'),
                  validator: (v) => (v == null || v.isEmpty) ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: newPasswordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'New password'),
                  validator: (v) =>
                      (v == null || v.length < 8) ? 'Must be at least 8 characters' : null,
                ),
                if (errorText != null) ...[
                  const SizedBox(height: 12),
                  Text(errorText!, style: const TextStyle(color: Colors.red, fontSize: 12)),
                ],
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: isSubmitting ? null : () => Navigator.pop(dialogContext),
              child: Text('common.cancel'.tr()),
            ),
            ElevatedButton(
              onPressed: isSubmitting
                  ? null
                  : () async {
                      if (!(formKey.currentState?.validate() ?? false)) return;
                      setDialogState(() {
                        isSubmitting = true;
                        errorText = null;
                      });
                      final result = await _authRepository.changePassword(
                        currentPassword: currentPasswordController.text,
                        newPassword: newPasswordController.text,
                      );
                      result.fold(
                        (Failure failure) => setDialogState(() {
                          isSubmitting = false;
                          errorText = failure.message;
                        }),
                        (_) {
                          Navigator.pop(dialogContext);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('common.success'.tr())),
                          );
                        },
                      );
                    },
              child: isSubmitting
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text('common.save'.tr()),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _showAboutDialog(BuildContext context) async {
    final info = await PackageInfo.fromPlatform();
    if (!context.mounted) return;
    showAboutDialog(
      context: context,
      applicationName: 'Aguka Smart Farming Kit',
      applicationVersion: 'v${info.version} (${info.buildNumber})',
      applicationLegalese: '© ${DateTime.now().year} Aguka Smart Farming Kit',
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Text(
        title,
        style: TextStyle(
          color: Colors.green[800],
          fontWeight: FontWeight.bold,
          fontSize: 14,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}
