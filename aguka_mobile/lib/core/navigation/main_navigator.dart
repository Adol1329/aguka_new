import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:easy_localization/easy_localization.dart';

import 'package:aguka_mobile/core/bloc/navigation/navigation_cubit.dart';
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
  final Set<int> _loadedPages = {0};

  @override
  void initState() {
    super.initState();
    // Start telemetry subscription when navigator initializes
    context.read<TelemetryBloc>().add(StartTelemetrySubscription());
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<NavigationCubit, NavigationState>(
      builder: (context, state) {
        // Track loaded pages for lazy loading within IndexedStack
        if (!_loadedPages.contains(state.index)) {
          _loadedPages.add(state.index);
        }

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
              children: List.generate(state.availableTabs.length, (index) {
                final tab = state.availableTabs[index];
                // Only render the page if it has been visited at least once
                return _loadedPages.contains(index) 
                  ? tab.page 
                  : const SizedBox.shrink();
              }),
            ),
            bottomNavigationBar: _buildBottomBar(context, state),
          ),
        );
      },
    );
  }

  Widget _buildBottomBar(BuildContext context, NavigationState state) {
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
            currentIndex: state.index,
            onTap: (index) {
              HapticFeedback.selectionClick();
              context.read<NavigationCubit>().navigateTo(state.availableTabs[index].item);
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
            items: state.availableTabs.map((tab) {
              return BottomNavigationBarItem(
                icon: Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Icon(tab.icon),
                ),
                activeIcon: Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Icon(tab.activeIcon),
                ),
                label: tab.labelKey.tr(),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
