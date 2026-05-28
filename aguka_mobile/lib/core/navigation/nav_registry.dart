import 'package:flutter/material.dart';
import 'nav_models.dart';
import 'package:aguka_mobile/features/dashboard/presentation/pages/dashboard_page.dart';
import 'package:aguka_mobile/features/telemetry/presentation/soil_page.dart';
import 'package:aguka_mobile/features/telemetry/presentation/weather_page.dart';
import 'package:aguka_mobile/features/irrigation/presentation/pages/irrigation_page.dart';
import 'package:aguka_mobile/features/market/presentation/market_page.dart';
import 'package:aguka_mobile/features/community/presentation/community_page.dart';
import 'package:aguka_mobile/features/reports/presentation/reports_page.dart';
import 'package:aguka_mobile/features/notifications/presentation/pages/notifications_page.dart';
import 'package:aguka_mobile/features/cooperatives/presentation/cooperatives_page.dart';
import 'package:aguka_mobile/features/activities/presentation/pages/activities_page.dart';
import 'package:aguka_mobile/features/guidance/presentation/pages/guidance_page.dart';

class NavRegistry {
   static List<NavTabConfig> getAllTabs() {
     return const [
       NavTabConfig(
         item: NavItem.dashboard,
         icon: Icons.dashboard_outlined,
         activeIcon: Icons.dashboard_rounded,
         labelKey: 'dashboard.title',
         page: DashboardPage(),
       ),
       NavTabConfig(
         item: NavItem.soil,
         icon: Icons.grass_outlined,
         activeIcon: Icons.grass_rounded,
         labelKey: 'soil.title',
         page: SoilPage(),
       ),
       NavTabConfig(
         item: NavItem.weather,
         icon: Icons.wb_sunny_outlined,
         activeIcon: Icons.wb_sunny_rounded,
         labelKey: 'weather.title',
         page: WeatherPage(),
       ),
       NavTabConfig(
         item: NavItem.irrigation,
         icon: Icons.water_drop_outlined,
         activeIcon: Icons.water_drop_rounded,
         labelKey: 'irrigation.title',
         page: IrrigationPage(),
       ),
       NavTabConfig(
         item: NavItem.activities,
         icon: Icons.assignment_outlined,
         activeIcon: Icons.assignment_rounded,
         labelKey: 'Activities',
         page: ActivitiesPage(),
       ),
       NavTabConfig(
         item: NavItem.guidance,
         icon: Icons.menu_book_outlined,
         activeIcon: Icons.menu_book_rounded,
         labelKey: 'Guidance',
         page: GuidancePage(),
       ),
       NavTabConfig(
         item: NavItem.market,
         icon: Icons.store_outlined,
         activeIcon: Icons.store_rounded,
         labelKey: 'market.title',
         page: MarketPage(),
       ),
       NavTabConfig(
         item: NavItem.community,
         icon: Icons.forum_outlined,
         activeIcon: Icons.forum_rounded,
         labelKey: 'community.title',
         page: CommunityPage(),
       ),
       NavTabConfig(
         item: NavItem.reports,
         icon: Icons.assessment_outlined,
         activeIcon: Icons.assessment_rounded,
         labelKey: 'reports.title',
         page: ReportsPage(),
       ),
       NavTabConfig(
         item: NavItem.notifications,
         icon: Icons.notifications_outlined,
         activeIcon: Icons.notifications_rounded,
         labelKey: 'notifications.title',
         page: NotificationsPage(),
       ),
       NavTabConfig(
         item: NavItem.cooperatives,
         icon: Icons.business_outlined,
         activeIcon: Icons.business_rounded,
         labelKey: 'cooperatives.title',
         page: CooperativesPage(),
       ),
     ];
   }

   static List<NavTabConfig> getTabsForRole(String? role) {
     final allTabs = getAllTabs();
     final roleItems = _getItemsForRole(role);
     return allTabs.where((tab) => roleItems.contains(tab.item)).toList();
   }

   static List<NavItem> _getItemsForRole(String? role) {
     final lowerCaseRole = role?.toLowerCase();
     switch (lowerCaseRole) {
       case 'farmer':
         return [
           NavItem.dashboard,
           NavItem.soil,
           NavItem.weather,
           NavItem.irrigation,
           NavItem.activities,
           NavItem.guidance,
           NavItem.market,
           NavItem.community,
           NavItem.notifications,
         ];
       case 'extension_officer':
         return [
           NavItem.dashboard,
           NavItem.soil,
           NavItem.reports,
           NavItem.community,
           NavItem.notifications,
         ];
       case 'cooperative_manager':
         return [
           NavItem.dashboard,
           NavItem.cooperatives,
           NavItem.market,
           NavItem.reports,
           NavItem.notifications,
         ];
       case 'admin':
       case 'super_admin':
         return NavItem.values;
       default:
         return [NavItem.dashboard, NavItem.notifications];
     }
   }
}
