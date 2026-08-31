import 'package:flutter/material.dart';

enum DashboardSectionType {
  statRow,
  cropList,
  twoCol,
  threeCol,
  fullWidth,
  quickActions,
  activityList,
  visitList,
  riskGrid,
  leaderboard,
  sidebarStack,
}

class DashboardSection {
  final DashboardSectionType type;
  final String? title;
  final String? subtitle;
  final IconData? icon;
  final Color? color;
  final List<DashboardCardConfig>? cards;
  final String? linkLabel;
  final VoidCallback? onLinkTap;

  const DashboardSection({
    required this.type,
    this.title,
    this.subtitle,
    this.icon,
    this.color,
    this.cards,
    this.linkLabel,
    this.onLinkTap,
  });
}

class DashboardCardConfig {
  final String label;
  final String? value;
  final String? subtitle;
  final IconData icon;
  final Color color;
  final Color? bgColor;
  final VoidCallback? onTap;

  const DashboardCardConfig({
    required this.label,
    this.value,
    this.subtitle,
    required this.icon,
    required this.color,
    this.bgColor,
    this.onTap,
  });
}

class DashboardConfig {
  final String titleKey;
  final String? subtitle;
  final List<DashboardSection> sections;

  const DashboardConfig({
    required this.titleKey,
    this.subtitle,
    required this.sections,
  });

  static DashboardConfig forRole(String? role) {
    switch (role) {
      case 'farmer':
        return _farmerConfig();
      case 'extension_officer':
        return _officerConfig();
      case 'cooperative_manager':
        return _cooperativeConfig();
      default:
        return _farmerConfig();
    }
  }

  static DashboardConfig _farmerConfig() {
    return DashboardConfig(
      titleKey: 'dashboard.title',
      subtitle: null,
      sections: [
        DashboardSection(
          type: DashboardSectionType.statRow,
          cards: [
            DashboardCardConfig(
              label: 'Soil Moisture',
              icon: Icons.water_drop,
              color: const Color(0xFF1D9E75),
            ),
            DashboardCardConfig(
              label: 'Soil Temp',
              icon: Icons.thermostat,
              color: const Color(0xFFE67E22),
            ),
            DashboardCardConfig(
              label: 'Soil pH',
              icon: Icons.science,
              color: const Color(0xFF3498DB),
            ),
            DashboardCardConfig(
              label: 'Weather',
              icon: Icons.wb_sunny,
              color: const Color(0xFFF39C12),
            ),
          ],
        ),
        DashboardSection(type: DashboardSectionType.cropList, title: 'My Crops'),
        DashboardSection(
          type: DashboardSectionType.twoCol,
          title: 'Monitoring',
          cards: [
            DashboardCardConfig(
              label: 'Soil Moisture Trend',
              icon: Icons.show_chart,
              color: const Color(0xFF1D9E75),
            ),
            DashboardCardConfig(
              label: '7-Day Forecast',
              icon: Icons.calendar_today,
              color: const Color(0xFF3498DB),
            ),
          ],
        ),
        DashboardSection(
          type: DashboardSectionType.quickActions,
          title: 'Quick Actions',
          cards: [
            DashboardCardConfig(
              label: 'My Crops',
              icon: Icons.eco,
              color: const Color(0xFF1D9E75),
            ),
            DashboardCardConfig(
              label: 'Expert Guides',
              icon: Icons.menu_book,
              color: const Color(0xFF8E44AD),
            ),
          ],
        ),
        DashboardSection(
          type: DashboardSectionType.twoCol,
          title: 'Community',
          cards: [
            DashboardCardConfig(
              label: 'Farmer Community',
              icon: Icons.people,
              color: const Color(0xFF2ECC71),
            ),
            DashboardCardConfig(
              label: 'Notifications',
              icon: Icons.notifications,
              color: const Color(0xFFE74C3C),
            ),
          ],
        ),
        DashboardSection(
          type: DashboardSectionType.activityList,
          title: 'Recent Activities',
        ),
      ],
    );
  }

  static DashboardConfig _officerConfig() {
    return DashboardConfig(
      titleKey: 'dashboard.officer_title',
      subtitle: 'Operational overview of your assigned farmers and field activities.',
      sections: [
        DashboardSection(
          type: DashboardSectionType.statRow,
          cards: [
            DashboardCardConfig(
              label: 'Assigned Farmers',
              icon: Icons.people,
              color: const Color(0xFF1D9E75),
              value: '0',
            ),
            DashboardCardConfig(
              label: 'Farms Monitored',
              icon: Icons.agriculture,
              color: const Color(0xFF27AE60),
              value: '0',
            ),
            DashboardCardConfig(
              label: 'Pending Visits',
              icon: Icons.list_alt,
              color: const Color(0xFFE67E22),
              value: '0',
            ),
            DashboardCardConfig(
              label: 'Active Risks',
              icon: Icons.warning,
              color: const Color(0xFFE74C3C),
              value: '0',
            ),
          ],
        ),
        DashboardSection(
          type: DashboardSectionType.visitList,
          title: 'Pending Field Visits',
          subtitle: 'Scheduled visits requiring action',
        ),
        DashboardSection(
          type: DashboardSectionType.activityList,
          title: 'Recent Activities',
        ),
        DashboardSection(
          type: DashboardSectionType.riskGrid,
          title: 'High-Level Risk Summary',
          subtitle: 'Active risks in your assigned zones',
        ),
      ],
    );
  }

  static DashboardConfig _cooperativeConfig() {
    return DashboardConfig(
      titleKey: 'dashboard.cooperative_title',
      subtitle: 'Aggregated oversight of your cooperative network and member performance.',
      sections: [
        DashboardSection(
          type: DashboardSectionType.statRow,
          cards: [
            DashboardCardConfig(
              label: 'Total Members',
              icon: Icons.people,
              color: const Color(0xFF1D9E75),
              value: '0',
            ),
            DashboardCardConfig(
              label: 'Active Hectares',
              icon: Icons.square_foot,
              color: const Color(0xFF27AE60),
              value: '0',
            ),
            DashboardCardConfig(
              label: 'Network Yield',
              icon: Icons.trending_up,
              color: const Color(0xFF2980B9),
              value: '0%',
            ),
            DashboardCardConfig(
              label: 'Shared Assets',
              icon: Icons.widgets,
              color: const Color(0xFFF39C12),
              value: '0',
            ),
          ],
        ),
        DashboardSection(type: DashboardSectionType.leaderboard, title: 'Member Performance Rankings'),
        DashboardSection(
          type: DashboardSectionType.sidebarStack,
          title: 'Network Overview',
          cards: [
            DashboardCardConfig(
              label: 'Network Health',
              icon: Icons.favorite_border,
              color: const Color(0xFF1D9E75),
            ),
            DashboardCardConfig(
              label: 'Performance Analysis',
              icon: Icons.analytics,
              color: const Color(0xFF8E44AD),
            ),
            DashboardCardConfig(
              label: 'Upcoming Events',
              icon: Icons.event,
              color: const Color(0xFF3498DB),
            ),
          ],
        ),
      ],
    );
  }
}
