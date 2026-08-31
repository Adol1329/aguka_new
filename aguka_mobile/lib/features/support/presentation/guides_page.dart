import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:aguka_mobile/widgets/aguka_app_bar.dart';

class GuidesPage extends StatelessWidget {
  const GuidesPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final guides = [
      ('help.guide1_title', 'help.guide1_desc', Icons.storefront_outlined),
      ('help.guide2_title', 'help.guide2_desc', Icons.water_drop_outlined),
      ('help.guide3_title', 'help.guide3_desc', Icons.groups_outlined),
      ('help.guide4_title', 'help.guide4_desc', Icons.bar_chart_outlined),
    ];

    return Scaffold(
      appBar: AgukaAppBar(
        title: 'help.guides_title'.tr(),
        showFilter: false,
        showDrawer: false,
      ),
      body: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: guides.length,
        separatorBuilder: (_, __) => const SizedBox(height: 8),
        itemBuilder: (context, i) {
          final (titleKey, descKey, icon) = guides[i];
          return Card(
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            child: ExpansionTile(
              leading: CircleAvatar(
                backgroundColor: Colors.green[50],
                child: Icon(icon, color: Colors.green),
              ),
              title: Text(titleKey.tr(), style: const TextStyle(fontWeight: FontWeight.w600)),
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  child: Text(descKey.tr(), style: TextStyle(color: Colors.grey[700])),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
