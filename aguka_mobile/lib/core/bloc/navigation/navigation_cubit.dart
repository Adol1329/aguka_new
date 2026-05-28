import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/utils/preferences_helper.dart';
import 'package:aguka_mobile/core/navigation/nav_models.dart';
import 'package:aguka_mobile/core/navigation/nav_registry.dart';

class NavigationState {
  final NavItem currentItem;
  final int index;
  final List<NavTabConfig> availableTabs;

  NavigationState({
    required this.currentItem,
    required this.index,
    required this.availableTabs,
  });

  factory NavigationState.initial(PreferencesHelper prefs) {
    final tabs = NavRegistry.getTabsForRole(prefs.userRole);
    return NavigationState(
      currentItem: tabs.isNotEmpty ? tabs[0].item : NavItem.dashboard,
      index: 0,
      availableTabs: tabs,
    );
  }

  NavigationState copyWith({
    NavItem? currentItem,
    int? index,
    List<NavTabConfig>? availableTabs,
  }) {
    return NavigationState(
      currentItem: currentItem ?? this.currentItem,
      index: index ?? this.index,
      availableTabs: availableTabs ?? this.availableTabs,
    );
  }
}

class NavigationCubit extends Cubit<NavigationState> {
  final GlobalKey<ScaffoldState> scaffoldKey = GlobalKey<ScaffoldState>();
  final PreferencesHelper _prefs;

  NavigationCubit(this._prefs) : super(NavigationState.initial(_prefs));

  /// Navigates to a specific item with security validation
  void navigateTo(NavItem item) {
    // SECURITY GUARD: Check if the item is available for the current role
    final tabIndex = state.availableTabs.indexWhere((tab) => tab.item == item);
    
    if (tabIndex != -1) {
      emit(state.copyWith(
        currentItem: item,
        index: tabIndex,
      ));
    } else {
      // Security: unauthorized navigation attempt — only log in debug builds
      if (kDebugMode) {
        debugPrint('SECURITY: Unauthorized navigation attempt to $item for role ${_prefs.userRole}');
      }
    }
  }

  /// Refreshes the navigation configuration (e.g., after login/role change)
  void refreshNavigation() {
    emit(NavigationState.initial(_prefs));
  }

  void openDrawer() {
    scaffoldKey.currentState?.openDrawer();
  }

  void openEndDrawer() {
    scaffoldKey.currentState?.openEndDrawer();
  }
}
