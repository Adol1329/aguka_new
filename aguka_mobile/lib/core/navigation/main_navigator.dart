import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';

import 'package:aguka_mobile/core/bloc/navigation/navigation_cubit.dart';

import 'package:aguka_mobile/core/navigation/nav_registry.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_bloc.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_event.dart';
import 'package:aguka_mobile/widgets/app_drawer.dart';
import 'package:aguka_mobile/widgets/filter_drawer.dart';

class MainNavigator extends StatefulWidget {
  const MainNavigator({Key? key}) : super(key: key);

  @override
  State<MainNavigator> createState() => _MainNavigatorState();
}

class _MainNavigatorState extends State<MainNavigator> {
  @override
  void initState() {
    super.initState();
    context.read<NavigationCubit>().refreshNavigation();
    context.read<TelemetryBloc>().add(StartTelemetrySubscription());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<NavigationCubit, NavigationState>(
      builder: (context, state) {
        return AnnotatedRegion<SystemUiOverlayStyle>(
          value: const SystemUiOverlayStyle(
            systemNavigationBarColor: Colors.white,
            systemNavigationBarIconBrightness: Brightness.dark,
          ),
          child: Scaffold(
            key: context.read<NavigationCubit>().scaffoldKey,
            drawer: const AppDrawer(),
            endDrawer: const FilterDrawer(),
            body: IndexedStack(
              index: state.index,
              children: state.availableTabs.map((tab) => tab.page).toList(),
            ),
            bottomNavigationBar: _buildBottomBar(context, state),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar(BuildContext context, NavigationState state) {
    final role = context.read<NavigationCubit>().getCurrentRole();
    final bottomNavItems = NavRegistry.getBottomNavItems(role);

    final visibleTabs = state.availableTabs
        .where((tab) => bottomNavItems.contains(tab.item))
        .toList();

    final activeItem = state.index < state.availableTabs.length
        ? state.availableTabs[state.index].item
        : null;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
        border: Border(
          top: BorderSide(color: Colors.grey.shade200, width: 1),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: BottomNavigationBar(
            currentIndex: visibleTabs.indexWhere(
                (t) => t.item == activeItem).clamp(0, visibleTabs.length - 1),
            onTap: (index) {
              if (index < visibleTabs.length) {
                HapticFeedback.selectionClick();
                context.read<NavigationCubit>().navigateTo(visibleTabs[index].item);
              }
            },
            type: BottomNavigationBarType.fixed,
            elevation: 0,
            backgroundColor: Colors.transparent,
            selectedItemColor: Theme.of(context).primaryColor,
            unselectedItemColor: Colors.grey[400],
            selectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 11,
            ),
            unselectedLabelStyle: const TextStyle(
              fontWeight: FontWeight.w500,
              fontSize: 11,
            ),
            showUnselectedLabels: true,
            items: visibleTabs.map((tab) {
              final label = tab.labelKey.tr();
              return BottomNavigationBarItem(
                icon: Semantics(
                  label: label,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Icon(tab.icon),
                  ),
                ),
                activeIcon: Semantics(
                  label: label,
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 4),
                    child: Icon(tab.activeIcon),
                  ),
                ),
                label: label,
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
