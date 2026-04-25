import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nself_auth_sdk/nself_auth_sdk.dart';

import '../services/backend_service.dart';

// BackendService is still used for server-URL persistence, GraphQL, and
// password-reset — auth tokens are now owned by the SDK.
final backendServiceProvider = Provider<BackendService>((ref) => BackendService());

// ── SDK-backed auth state ─────────────────────────────────────────────────────

/// Wraps [NSelfAuth.onAuthStateChange] as a Riverpod [StreamProvider].
///
/// Emits `true` when a user is logged in, `false` when logged out or loading.
/// The app shell in `app.dart` uses this to decide which screen to show.
final authStateProvider = StreamProvider<bool>((ref) {
  return NSelfAuth.onAuthStateChange.map((state) => state is AuthStateLoggedIn);
});

/// Exposes the current [User] object (null when signed out).
final currentUserProvider = Provider<User?>((ref) => NSelfAuth.currentUser);

// ── Auth notifier ─────────────────────────────────────────────────────────────

class AuthNotifier extends AsyncNotifier<User?> {
  @override
  Future<User?> build() async => NSelfAuth.currentUser;

  /// Sign in with the given nSelf backend URL, email, and password.
  ///
  /// Persists the server URL in [BackendService] for GraphQL calls, then
  /// delegates auth to [NSelfAuth.signIn] which handles token storage,
  /// auto-refresh, and device registration.
  Future<bool> signIn(String serverUrl, String email, String password) async {
    state = const AsyncLoading();
    try {
      // Persist the server URL so GraphQL calls in BackendService can use it.
      await ref.read(backendServiceProvider).setServerUrl(serverUrl);

      // Re-initialise the SDK with the user-provided auth base URL.
      // Format: <serverUrl>/v1/auth  (nSelf nHost Auth endpoint)
      await NSelfAuth.initialize(
        authBaseUrl: '${serverUrl.trimRight().replaceAll(RegExp(r'/$'), '')}/v1/auth',
        appVersion: '1.0.9',
      );

      final user = await NSelfAuth.signIn(email, password);
      state = AsyncData(user);
      return true;
    } catch (e) {
      state = const AsyncData(null);
      return false;
    }
  }

  /// Sign out via the SDK (clears tokens, unregisters device).
  Future<void> signOut() async {
    await NSelfAuth.signOut();
    state = const AsyncData(null);
  }

  /// Returns a valid access token for GraphQL calls, auto-refreshing as needed.
  Future<String?> getAccessToken() => NSelfAuth.getAccessToken();
}

final authNotifierProvider =
    AsyncNotifierProvider<AuthNotifier, User?>(AuthNotifier.new);
