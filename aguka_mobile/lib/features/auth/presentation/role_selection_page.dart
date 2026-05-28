import 'package:flutter/material.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:aguka_mobile/features/auth/presentation/register_page.dart';

class RoleSelectionPage extends StatefulWidget {
  const RoleSelectionPage({Key? key}) : super(key: key);

  @override
  State<RoleSelectionPage> createState() => _RoleSelectionPageState();
}

class _RoleSelectionPageState extends State<RoleSelectionPage> {
  String? _selectedRole;

  final List<RoleItem> _roles = [
    RoleItem(
      id: 'FARMER',
      icon: '🌱',
      titleKey: 'role_selection.farmer.name',
      descKey: 'role_selection.farmer.desc',
      color: Colors.green,
    ),
    RoleItem(
      id: 'EXTENSION_OFFICER',
      icon: '👨‍💼',
      titleKey: 'role_selection.extension_officer.name',
      descKey: 'role_selection.extension_officer.desc',
      color: Colors.blue,
    ),
    RoleItem(
      id: 'COOPERATIVE_MANAGER',
      icon: '🤝',
      titleKey: 'role_selection.cooperative_manager.name',
      descKey: 'role_selection.cooperative_manager.desc',
      color: Colors.orange,
    ),
  ];

  Future<void> _onContinue() async {
    if (_selectedRole == null) return;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_role', _selectedRole!);

    if (!mounted) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => RegisterPage(role: _selectedRole!),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 20),
              Text(
                'role_selection.title'.tr(),
                style: const TextStyle(
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF0B2D1D),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              Expanded(
                child: ListView.separated(
                  itemCount: _roles.length,
                  separatorBuilder: (context, index) => const SizedBox(height: 20),
                  itemBuilder: (context, index) {
                    final role = _roles[index];
                    final isSelected = _selectedRole == role.id;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedRole = role.id),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: isSelected ? role.color.withValues(alpha: 0.05) : Colors.grey[50],
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected ? role.color : Colors.grey[200]!,
                            width: 2,
                          ),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: role.color.withValues(alpha: 0.1),
                                    blurRadius: 10,
                                    offset: const Offset(0, 4),
                                  )
                                ]
                              : [],
                        ),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                role.icon,
                                style: const TextStyle(fontSize: 32),
                              ),
                            ),
                            const SizedBox(width: 20),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    role.titleKey.tr(),
                                    style: TextStyle(
                                      fontSize: 18,
                                      fontWeight: FontWeight.bold,
                                      color: isSelected ? role.color : const Color(0xFF0B2D1D),
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    role.descKey.tr(),
                                    style: TextStyle(
                                      fontSize: 14,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (isSelected)
                              Icon(Icons.check_circle, color: role.color, size: 28),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _selectedRole != null ? _onContinue : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF0B2D1D),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  disabledBackgroundColor: Colors.grey[300],
                ),
                child: Text(
                  'role_selection.continue'.tr(),
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1,
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }
}

class RoleItem {
  final String id;
  final String icon;
  final String titleKey;
  final String descKey;
  final Color color;

  RoleItem({
    required this.id,
    required this.icon,
    required this.titleKey,
    required this.descKey,
    required this.color,
  });
}
