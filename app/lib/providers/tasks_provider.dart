import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';

import '../models/task.dart';
import '../models/cached_task.dart';
import 'auth_provider.dart';

final selectedListIdProvider = StateProvider<String?>((ref) => null);

final tasksProvider = FutureProvider.family<List<Task>, String>((ref, listId) async {
  final service = ref.watch(backendServiceProvider);
  try {
    final tasks = await service.getTasks(listId);
    final box = Hive.box<CachedTask>('tasks');
    for (final task in tasks) {
      final cached = CachedTask()
        ..id = task.id
        ..title = task.title
        ..description = task.description
        ..completed = task.completed
        ..dueDate = task.dueDate?.toIso8601String()
        ..listId = task.listId
        ..position = task.position
        ..createdAt = task.createdAt.toIso8601String()
        ..updatedAt = task.updatedAt.toIso8601String();
      await box.put(task.id, cached);
    }
    return tasks;
  } catch (_) {
    final box = Hive.box<CachedTask>('tasks');
    return box.values
        .where((c) => c.listId == listId)
        .map((c) => Task(
          id: c.id,
          title: c.title,
          description: c.description,
          completed: c.completed,
          dueDate: c.dueDate != null ? DateTime.parse(c.dueDate!) : null,
          listId: c.listId,
          position: c.position,
          createdAt: DateTime.parse(c.createdAt),
          updatedAt: DateTime.parse(c.updatedAt),
        ))
        .toList();
  }
});
