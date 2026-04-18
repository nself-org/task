import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../l10n/app_localizations.dart';

import '../models/task.dart';
import '../providers/auth_provider.dart';
import '../providers/tasks_provider.dart';
import '../widgets/offline_banner.dart';
import 'task_detail_screen.dart';

class ListScreen extends ConsumerStatefulWidget {
  final String listId;
  final String listTitle;

  const ListScreen({super.key, required this.listId, required this.listTitle});

  @override
  ConsumerState<ListScreen> createState() => _ListScreenState();
}

class _ListScreenState extends ConsumerState<ListScreen> {
  final FocusNode _focusNode = FocusNode();

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    final ctrl = HardwareKeyboard.instance.isControlPressed;
    if (!ctrl) return KeyEventResult.ignored;

    if (event.logicalKey == LogicalKeyboardKey.keyN) {
      _showNewTaskDialog(context, ref);
      return KeyEventResult.handled;
    }

    if (event.logicalKey == LogicalKeyboardKey.keyW) {
      // Mark the first incomplete task as complete (archive/close it).
      final tasks = ref.read(tasksProvider(widget.listId));
      tasks.whenData((data) async {
        final incomplete = data.where((t) => !t.completed).toList();
        if (incomplete.isNotEmpty) {
          final service = ref.read(backendServiceProvider);
          await service.toggleTask(incomplete.first.id, true);
          ref.invalidate(tasksProvider(widget.listId));
        }
      });
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final tasks = ref.watch(tasksProvider(widget.listId));

    return Focus(
      focusNode: _focusNode,
      autofocus: true,
      onKeyEvent: _handleKeyEvent,
      child: Scaffold(
        appBar: AppBar(
          title: Semantics(
            header: true,
            label: widget.listTitle,
            child: Text(widget.listTitle),
          ),
        ),
        body: Column(
          children: [
            const OfflineBanner(),
            Expanded(
              child: tasks.when(
                data: (data) => data.isEmpty
                    ? _EmptyTasksState(
                        onAddTask: () => _showNewTaskDialog(context, ref),
                        onRefresh: () async => ref.invalidate(tasksProvider(widget.listId)),
                      )
                    : RefreshIndicator(
                        onRefresh: () async => ref.invalidate(tasksProvider(widget.listId)),
                        child: ListView.builder(
                          itemCount: data.length,
                          itemBuilder: (_, i) =>
                              _TaskItem(task: data[i], listId: widget.listId),
                        ),
                      ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (e, _) => Center(child: Text('${l10n.error}: $e')),
              ),
            ),
          ],
        ),
        floatingActionButton: Semantics(
          button: true,
          label: l10n.newTask,
          child: FloatingActionButton(
            onPressed: () => _showNewTaskDialog(context, ref),
            tooltip: l10n.newTask,
            child: const Icon(Icons.add),
          ),
        ),
      ),
    );
  }

  void _showNewTaskDialog(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final ctrl = TextEditingController();
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.newTask),
        content: TextField(
          controller: ctrl,
          decoration: InputDecoration(labelText: l10n.taskTitle),
          autofocus: true,
          textCapitalization: TextCapitalization.sentences,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () async {
              if (ctrl.text.trim().isNotEmpty) {
                Navigator.pop(ctx);
                final service = ref.read(backendServiceProvider);
                await service.createTask(widget.listId, ctrl.text.trim());
                ref.invalidate(tasksProvider(widget.listId));
              }
            },
            child: Text(l10n.save),
          ),
        ],
      ),
    );
  }
}

// ── Task list item ─────────────────────────────────────────────────────────────

class _TaskItem extends ConsumerWidget {
  final Task task;
  final String listId;

  const _TaskItem({required this.task, required this.listId});

  Color _priorityColor(TaskPriority p) {
    switch (p) {
      case TaskPriority.high:
        return Colors.red;
      case TaskPriority.medium:
        return Colors.amber;
      case TaskPriority.low:
        return Colors.grey;
      case TaskPriority.none:
        return Colors.transparent;
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final dotColor = _priorityColor(task.priority);

    return Dismissible(
      key: ValueKey(task.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        color: theme.colorScheme.error,
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      confirmDismiss: (_) => _confirmDeleteDialog(context),
      onDismissed: (_) async {
        final service = ref.read(backendServiceProvider);
        await service.deleteTask(task.id);
        ref.invalidate(tasksProvider(listId));
      },
      child: ListTile(
        leading: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (task.priority != TaskPriority.none)
              Container(
                width: 8,
                height: 8,
                margin: const EdgeInsets.only(right: 6),
                decoration: BoxDecoration(
                  color: dotColor,
                  shape: BoxShape.circle,
                ),
              ),
            Checkbox(
              value: task.completed,
              onChanged: (v) async {
                final service = ref.read(backendServiceProvider);
                await service.toggleTask(task.id, v ?? false);
                ref.invalidate(tasksProvider(listId));
              },
            ),
          ],
        ),
        title: Text(
          task.title,
          style: task.completed
              ? TextStyle(
                  decoration: TextDecoration.lineThrough,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                )
              : null,
        ),
        subtitle: task.dueDate != null
            ? Text(
                '${l10n.dueDate}: ${task.dueDate!.toLocal().toString().split(' ')[0]}',
                style: theme.textTheme.bodySmall,
              )
            : null,
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (_) => TaskDetailScreen(task: task, listId: listId),
          ),
        ).then((_) => ref.invalidate(tasksProvider(listId))),
        onLongPress: () => _showTaskOptions(context, ref),
      ),
    );
  }

  Future<bool> _confirmDeleteDialog(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;
    final result = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.deleteTask),
        content: Text(l10n.deleteTaskConfirm),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: Theme.of(ctx).colorScheme.error,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(l10n.delete),
          ),
        ],
      ),
    );
    return result ?? false;
  }

  void _showTaskOptions(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.edit_outlined),
              title: Text(l10n.editTitle),
              onTap: () {
                Navigator.pop(ctx);
                _showEditTitleDialog(context, ref);
              },
            ),
            ListTile(
              leading: const Icon(Icons.calendar_today_outlined),
              title: Text(l10n.setDueDate),
              onTap: () {
                Navigator.pop(ctx);
                _showDatePicker(context, ref);
              },
            ),
            ListTile(
              leading: const Icon(Icons.flag_outlined),
              title: Text(l10n.setPriority),
              onTap: () {
                Navigator.pop(ctx);
                _showPriorityPicker(context, ref);
              },
            ),
            ListTile(
              leading: Icon(
                Icons.delete_outline,
                color: Theme.of(ctx).colorScheme.error,
              ),
              title: Text(
                l10n.deleteTask,
                style: TextStyle(color: Theme.of(ctx).colorScheme.error),
              ),
              onTap: () async {
                Navigator.pop(ctx);
                final confirmed = await _confirmDeleteDialog(context);
                if (confirmed) {
                  final service = ref.read(backendServiceProvider);
                  await service.deleteTask(task.id);
                  ref.invalidate(tasksProvider(listId));
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showEditTitleDialog(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    final ctrl = TextEditingController(text: task.title);
    showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.editTitle),
        content: TextField(
          controller: ctrl,
          decoration: InputDecoration(labelText: l10n.taskTitle),
          autofocus: true,
          textCapitalization: TextCapitalization.sentences,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.cancel),
          ),
          FilledButton(
            onPressed: () async {
              final newTitle = ctrl.text.trim();
              Navigator.pop(ctx);
              if (newTitle.isNotEmpty && newTitle != task.title) {
                final service = ref.read(backendServiceProvider);
                await service.updateTask(task.id, title: newTitle);
                ref.invalidate(tasksProvider(listId));
              }
            },
            child: Text(l10n.save),
          ),
        ],
      ),
    );
  }

  Future<void> _showDatePicker(BuildContext context, WidgetRef ref) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: task.dueDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null) {
      final service = ref.read(backendServiceProvider);
      await service.updateTask(task.id, dueDate: picked);
      ref.invalidate(tasksProvider(listId));
    }
  }

  void _showPriorityPicker(BuildContext context, WidgetRef ref) {
    final l10n = AppLocalizations.of(context)!;
    showModalBottomSheet<void>(
      context: context,
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
              child: Text(
                l10n.setPriority,
                style: Theme.of(ctx).textTheme.titleMedium,
              ),
            ),
            _PriorityOption(
              label: l10n.priorityLow,
              color: Colors.grey,
              selected: task.priority == TaskPriority.low,
              onTap: () async {
                Navigator.pop(ctx);
                final service = ref.read(backendServiceProvider);
                await service.updateTask(task.id, priority: 'low');
                ref.invalidate(tasksProvider(listId));
              },
            ),
            _PriorityOption(
              label: l10n.priorityMedium,
              color: Colors.amber,
              selected: task.priority == TaskPriority.medium,
              onTap: () async {
                Navigator.pop(ctx);
                final service = ref.read(backendServiceProvider);
                await service.updateTask(task.id, priority: 'medium');
                ref.invalidate(tasksProvider(listId));
              },
            ),
            _PriorityOption(
              label: l10n.priorityHigh,
              color: Colors.red,
              selected: task.priority == TaskPriority.high,
              onTap: () async {
                Navigator.pop(ctx);
                final service = ref.read(backendServiceProvider);
                await service.updateTask(task.id, priority: 'high');
                ref.invalidate(tasksProvider(listId));
              },
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}

// ── Priority option tile ───────────────────────────────────────────────────────

class _PriorityOption extends StatelessWidget {
  final String label;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _PriorityOption({
    required this.label,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        width: 12,
        height: 12,
        decoration: BoxDecoration(color: color, shape: BoxShape.circle),
      ),
      title: Text(label),
      trailing: selected ? const Icon(Icons.check) : null,
      onTap: onTap,
    );
  }
}

// ── Empty state ────────────────────────────────────────────────────────────────

class _EmptyTasksState extends StatelessWidget {
  final VoidCallback onAddTask;
  final Future<void> Function() onRefresh;

  const _EmptyTasksState({required this.onAddTask, required this.onRefresh});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView(
        children: [
          SizedBox(
            height: MediaQuery.of(context).size.height * 0.6,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.task_alt,
                  size: 80,
                  color: theme.colorScheme.primary.withValues(alpha: 0.3),
                ),
                const SizedBox(height: 24),
                Text(
                  l10n.noTasks,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  l10n.noTasksHint,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
                  ),
                ),
                const SizedBox(height: 24),
                FilledButton.tonal(
                  onPressed: onAddTask,
                  child: Text(l10n.addTask),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
