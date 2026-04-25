// Unit tests for nself_auth_sdk integration in ɳTasks.
//
// These tests exercise [NSelfAuth] via the [InMemoryStorageBackend] injected
// through the SDK's test constructor, so no platform channels are invoked and
// no real network calls are made.

import 'package:flutter_test/flutter_test.dart';
import 'package:nself_auth_sdk/nself_auth_sdk.dart';

void main() {
  setUp(() => NSelfAuth.dispose());
  tearDown(() => NSelfAuth.dispose());

  group('NSelfAuth — InMemoryStorageBackend (ntask)', () {
    test('initialize resolves without error using in-memory storage', () async {
      await NSelfAuth.initialize(
        authBaseUrl: 'https://test.example.com/v1/auth',
        appVersion: '1.0.9',
        tokenStore: TokenStore.withBackend(InMemoryStorageBackend()),
      );
      expect(NSelfAuth.currentUser, isNull);
    });

    test('onAuthStateChange emits nothing before sign-in', () async {
      await NSelfAuth.initialize(
        authBaseUrl: 'https://test.example.com/v1/auth',
        appVersion: '1.0.9',
        tokenStore: TokenStore.withBackend(InMemoryStorageBackend()),
      );
      // Stream should not emit synchronously when no session is stored.
      expectLater(
        NSelfAuth.onAuthStateChange.take(1).timeout(
          const Duration(milliseconds: 50),
          onTimeout: (sink) => sink.close(),
        ),
        emitsDone,
      );
    });

    test('getAccessToken returns null when signed out', () async {
      await NSelfAuth.initialize(
        authBaseUrl: 'https://test.example.com/v1/auth',
        appVersion: '1.0.9',
        tokenStore: TokenStore.withBackend(InMemoryStorageBackend()),
      );
      final token = await NSelfAuth.getAccessToken();
      expect(token, isNull);
    });

    test('initialize restores session from in-memory backend', () async {
      // Seed a stored user into the backend before init.
      final backend = InMemoryStorageBackend();
      final store = TokenStore.withBackend(backend);
      // Manually write a fake user so the SDK's cold-start restore path fires.
      await store.saveUser(User(
        id: 'u1',
        email: 'alice@example.com',
        displayName: 'Alice',
        tier: 'pro',
        activePlugins: const [],
        accessTokenExpiry: DateTime.now().add(const Duration(hours: 1)),
      ));
      await store.saveAccessToken('fake_token_abc');

      await NSelfAuth.initialize(
        authBaseUrl: 'https://test.example.com/v1/auth',
        appVersion: '1.0.9',
        tokenStore: store,
      );

      expect(NSelfAuth.currentUser?.email, 'alice@example.com');
    });
  });
}
