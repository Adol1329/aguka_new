import 'package:flutter/material.dart';
import 'package:aguka_mobile/features/auth/domain/entities/user_entity.dart';
import 'package:aguka_mobile/features/auth/presentation/farmer_onboarding_page.dart';
import 'package:aguka_mobile/features/auth/presentation/officer_onboarding_page.dart';
import 'package:aguka_mobile/features/auth/presentation/cooperative_onboarding_page.dart';

class RoleOnboardingDispatcher extends StatelessWidget {
  final UserEntity user;
  const RoleOnboardingDispatcher({Key? key, required this.user}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    switch (user.role.toUpperCase()) {
      case 'FARMER':
        return const FarmerOnboardingPage();
      case 'EXTENSION_OFFICER':
      case 'OFFICER':
        return const OfficerOnboardingPage();
      case 'COOPERATIVE_MANAGER':
      case 'COOPERATIVE':
        return const CooperativeOnboardingPage();
      default:
        return const Scaffold(
          body: Center(child: Text('Invalid role for onboarding')),
        );
    }
  }
}
