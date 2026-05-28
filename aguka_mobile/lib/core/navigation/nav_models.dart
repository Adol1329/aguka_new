import 'package:flutter/material.dart';

enum NavItem {
  dashboard,
  soil,
  weather,
  irrigation,
  activities,
  guidance,
  market,
  community,
  reports,
  cooperatives,
  notifications,
}

class NavTabConfig {
  final NavItem item;
  final IconData icon;
  final IconData activeIcon;
  final String labelKey;
  final Widget page;

  const NavTabConfig({
    required this.item,
    required this.icon,
    required this.activeIcon,
    required this.labelKey,
    required this.page,
  });
}
