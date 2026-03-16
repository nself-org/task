import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/backend_service.dart';

final backendServiceProvider = Provider<BackendService>((ref) => BackendService());

final authStateProvider = FutureProvider<Map<String, dynamic>?>((ref) async {
  final service = ref.watch(backendServiceProvider);
  return service.getCurrentUser();
});

class AuthNotifier extends AsyncNotifier<Map<String, dynamic>?> {
  @override
  Future<Map<String, dynamic>?> build() async {
    final service = ref.watch(backendServiceProvider);
    return service.getCurrentUser();
  }

  Future<bool> signIn(String serverUrl, String email, String password) async {
    state = const AsyncLoading();
    final service = ref.read(backendServiceProvider);
    final user = await service.signIn(serverUrl, email, password);
    state = AsyncData(user);
    return user != null;
  }

  Future<void> signOut() async {
    final service = ref.read(backendServiceProvider);
    await service.signOut();
    state = const AsyncData(null);
  }
}

final authNotifierProvider =
    AsyncNotifierProvider<AuthNotifier, Map<String, dynamic>?>(AuthNotifier.new);
