import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/core/bloc/navigation/navigation_cubit.dart';
import 'package:easy_localization/easy_localization.dart';

import 'package:flutter/services.dart';

class AgukaAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final List<Widget>? actions;
  final bool showProfileInfo;
  final bool showFilter;
  final bool showDrawer;
  final PreferredSizeWidget? bottom;

  const AgukaAppBar({
    Key? key,
    required this.title,
    this.actions,
    this.showProfileInfo = false,
    this.showFilter = true,
    this.showDrawer = true,
    this.bottom,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<AuthBloc, AuthState>(
      builder: (context, state) {
        String greeting = '';
        if (state is AuthAuthenticated) {
          final name = state.user.fullName ?? 'Farmer';
          greeting = '${'common.hello'.tr()}, ${name.split(' ')[0]}';
        }

        return AppBar(
          elevation: 2,
          centerTitle: !showProfileInfo,
          backgroundColor: Colors.green[700],
          leading: Navigator.of(context).canPop()
            ? const BackButton(color: Colors.white)
            : (showDrawer
              ? Builder(
                  builder: (context) => IconButton(
                    icon: const Icon(Icons.menu, color: Colors.white),
                    onPressed: () {
                      HapticFeedback.lightImpact();
                      context.read<NavigationCubit>().openDrawer();
                    },
                  ),
                )
              : const SizedBox.shrink()),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(
              bottom: Radius.circular(16),
            ),
          ),
          flexibleSpace: Container(
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(
                bottom: Radius.circular(16),
              ),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Colors.green[800]!, Colors.green[500]!],
              ),
            ),
          ),
          title: showProfileInfo
              ? Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      greeting,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.normal,
                        color: Colors.white70,
                      ),
                    ),
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                )
              : Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white),
                ),
          actions: [
            if (showFilter)
              Builder(
                builder: (context) => IconButton(
                  icon: const Icon(Icons.filter_list, color: Colors.white),
                  onPressed: () {
                    HapticFeedback.lightImpact();
                    context.read<NavigationCubit>().openEndDrawer();
                  },
                ),
              ),
            ...?actions,
            if (showProfileInfo)
              Padding(
                padding: const EdgeInsets.only(right: 16.0, left: 8.0),
                child: CircleAvatar(
                  radius: 16,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  child: const Icon(Icons.person, color: Colors.white, size: 20),
                ),
              ),
          ],
          bottom: bottom,
        );
      },
    );
  }

  @override
  Size get preferredSize {
    final bottomHeight = bottom?.preferredSize.height ?? 0.0;
    return Size.fromHeight(kToolbarHeight + 8 + bottomHeight);
  }
}
