import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class HelpPage extends StatelessWidget {
  const HelpPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AgukaAppBar(
        title: 'help.title'.tr(),
        showFilter: false,
        showDrawer: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Center(
              child: Icon(Icons.help_center_outlined, size: 80, color: Colors.green),
            ),
            const SizedBox(height: 20),
            Center(
              child: Text(
                'help.how_can_we_help'.tr(),
                style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 30),
            _buildHelpItem(
              context,
              icon: Icons.article_outlined,
              title: 'help.guides'.tr(),
              subtitle: 'help.guides_subtitle'.tr(),
              onTap: () {},
            ),
            _buildHelpItem(
              context,
              icon: Icons.chat_outlined,
              title: 'help.live_chat'.tr(),
              subtitle: 'help.live_chat_subtitle'.tr(),
              onTap: () {},
            ),
            _buildHelpItem(
              context,
              icon: Icons.phone_outlined,
              title: 'help.call_support'.tr(),
              subtitle: '+250 788 000 000',
              onTap: () {},
            ),
            _buildHelpItem(
              context,
              icon: Icons.email_outlined,
              title: 'help.email_support'.tr(),
              subtitle: 'support@aguka.rw',
              onTap: () {},
            ),
            const SizedBox(height: 40),
            const Text(
              'FAQ',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            _buildFaqItem('help.faq1_q'.tr(), 'help.faq1_a'.tr()),
            _buildFaqItem('help.faq2_q'.tr(), 'help.faq2_a'.tr()),
          ],
        ),
      ),
    );
  }

  Widget _buildHelpItem(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 1,
      margin: const EdgeInsets.only(bottom: 15),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green[50],
          child: Icon(icon, color: Colors.green),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  Widget _buildFaqItem(String question, String answer) {
    return ExpansionTile(
      title: Text(question, style: const TextStyle(fontWeight: FontWeight.w500)),
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          child: Text(answer, style: TextStyle(color: Colors.grey[700])),
        ),
      ],
    );
  }
}
