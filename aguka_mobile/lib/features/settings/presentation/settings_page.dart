import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class SettingsPage extends StatelessWidget {
  const SettingsPage({Key? key}) : super(key: key);

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
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.lock_outline),
            title: Text('settings.change_password'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          const Divider(),
          _buildSectionHeader('settings.notifications'.tr()),
          SwitchListTile(
            secondary: const Icon(Icons.notifications_active_outlined),
            title: Text('settings.push_notifications'.tr()),
            value: true,
            onChanged: (val) {},
          ),
          SwitchListTile(
            secondary: const Icon(Icons.sms_outlined),
            title: Text('settings.sms_alerts'.tr()),
            value: false,
            onChanged: (val) {},
          ),
          const Divider(),
          _buildSectionHeader('settings.app'.tr()),
          ListTile(
            leading: const Icon(Icons.dark_mode_outlined),
            title: Text('settings.dark_mode'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.info_outline),
            title: Text('settings.about'.tr()),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
        ],
      ),
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
