import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:shared_preferences/shared_preferences.dart';


import 'package:aguka_mobile/core/localization/rw_localizations.dart';
import 'injection_container.dart' as di;
import 'package:firebase_core/firebase_core.dart';
import 'package:aguka_mobile/services/firebase_service.dart';
import 'package:aguka_mobile/core/bloc/navigation/navigation_cubit.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_bloc.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_event.dart';
import 'package:aguka_mobile/features/auth/bloc/auth_state.dart';
import 'package:aguka_mobile/features/telemetry/bloc/telemetry_bloc.dart';
import 'package:aguka_mobile/shared/bloc/filter/filter_bloc.dart';

import 'package:aguka_mobile/features/auth/presentation/login_page.dart';
import 'package:aguka_mobile/features/auth/presentation/onboarding_page.dart';
import 'package:aguka_mobile/features/auth/presentation/role_onboarding_dispatcher.dart';
import 'package:aguka_mobile/features/auth/presentation/pending_review_page.dart';
import 'package:aguka_mobile/core/navigation/main_navigator.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await EasyLocalization.ensureInitialized();
  
  // Initialize Dependency Injection
  await di.init();
  
  // Initialize Firebase and FCM Messaging safely
  try {
    await Firebase.initializeApp();
    await di.sl<FirebaseService>().initialize();
    debugPrint("Firebase & FCM initialized successfully");
  } catch (e) {
    debugPrint("Firebase initialization failed gracefully: $e");
  }
  
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  final prefs = await SharedPreferences.getInstance();
  final bool onboardingCompleted = prefs.getBool('onboarding_completed') ?? false;

  runApp(
    EasyLocalization(
      supportedLocales: const [Locale('en'), Locale('rw'), Locale('fr')],
      path: 'assets/translations',
      fallbackLocale: const Locale('en'),
      child: AgukaApp(onboardingCompleted: onboardingCompleted),
    ),
  );
}

final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

class AgukaApp extends StatelessWidget {
  final bool onboardingCompleted;
  const AgukaApp({Key? key, required this.onboardingCompleted}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => di.sl<AuthBloc>()..add(AuthCheckRequested())),
        BlocProvider(create: (context) => di.sl<NavigationCubit>()),
        BlocProvider(create: (context) => di.sl<FilterBloc>()),
        BlocProvider(create: (context) => di.sl<TelemetryBloc>()),
      ],
      child: MaterialApp(
        title: 'Aguka Smart Farming kit',
        localizationsDelegates: [
          ...context.localizationDelegates,
          RwMaterialLocalizations.delegate,
          RwCupertinoLocalizations.delegate,
        ],
        supportedLocales: context.supportedLocales,
        locale: context.locale,
        debugShowCheckedModeBanner: false,
        scaffoldMessengerKey: scaffoldMessengerKey,
        theme: ThemeData(
          primarySwatch: Colors.green,
          scaffoldBackgroundColor: Colors.grey[50],
          appBarTheme: const AppBarTheme(
            elevation: 0,
            centerTitle: true,
          ),
        ),
        home: BlocBuilder<AuthBloc, AuthState>(
          builder: (context, state) {
            if (state is AuthAuthenticated) {
              if (!state.user.isOnboarded) {
                return RoleOnboardingDispatcher(user: state.user);
              }
              return const MainNavigator();
            }
            
            if (state is AuthPendingReview) {
              return const PendingReviewPage();
            }
            
            if (!onboardingCompleted) {
              return const OnboardingPage();
            }
            
            return const LoginPage();
          },
        ),
      ),
    );
  }
}
