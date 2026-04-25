import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'l10n/app_localizations.dart';
import 'theme/brand_colors.dart';

import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

class NTasksApp extends ConsumerWidget {
  const NTasksApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authStateProvider);

    return MaterialApp(
      title: 'ɳTask',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: NselfBrandColors.primary,
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: NselfBrandColors.primary,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
        fontFamily: 'Inter',
      ),
      themeMode: ThemeMode.system,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      // P96 S233: l10n — en + es, fr, de, ja, zh, ar stubs.
      supportedLocales: const [
        Locale('en'),
        Locale('es'),
        Locale('fr'),
        Locale('de'),
        Locale('ja'),
        Locale('zh'),
        Locale('ar'),
      ],
      home: auth.when(
        data: (loggedIn) => loggedIn ? const HomeScreen() : const LoginScreen(),
        loading: () => const _SplashScreen(),
        error: (_, _) => const LoginScreen(),
      ),
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
