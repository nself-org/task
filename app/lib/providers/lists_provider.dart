import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../models/task_list.dart';
import '../models/cached_task_list.dart';
import 'auth_provider.dart';

final listsProvider = FutureProvider<List<TaskList>>((ref) async {
  ref.watch(authStateProvider); // re-fetch on auth change
  final service = ref.watch(backendServiceProvider);
  try {
    final lists = await service.getLists();
    // Cache in Hive for offline use.
    final box = Hive.box<CachedTaskList>('task_lists');
    await box.clear();
    for (final list in lists) {
      final cached = CachedTaskList()
        ..id = list.id
        ..title = list.title
        ..description = list.description
        ..color = list.color
        ..position = list.position
        ..ownerId = list.ownerId
        ..createdAt = list.createdAt.toIso8601String()
        ..updatedAt = list.updatedAt.toIso8601String();
      await box.put(list.id, cached);
    }
    return lists;
  } catch (_) {
    // Offline fallback: return cached data.
    final box = Hive.box<CachedTaskList>('task_lists');
    return box.values.map((c) => TaskList(
      id: c.id,
      title: c.title,
      description: c.description,
      color: c.color,
      position: c.position,
      ownerId: c.ownerId,
      createdAt: DateTime.parse(c.createdAt),
      updatedAt: DateTime.parse(c.updatedAt),
    )).toList();
  }
});
