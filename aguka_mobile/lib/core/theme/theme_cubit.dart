import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:aguka_mobile/core/utils/preferences_helper.dart';

class ThemeCubit extends Cubit<ThemeMode> {
  final PreferencesHelper preferencesHelper;

  ThemeCubit({required this.preferencesHelper})
      : super(preferencesHelper.darkModeEnabled ? ThemeMode.dark : ThemeMode.light);

  Future<void> setDarkMode(bool enabled) async {
    await preferencesHelper.setDarkModeEnabled(enabled);
    emit(enabled ? ThemeMode.dark : ThemeMode.light);
  }
}
