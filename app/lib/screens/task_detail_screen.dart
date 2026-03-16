import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../l10n/app_localizations.dart';
import '../models/task.dart';
import '../providers/auth_provider.dart';
import '../providers/tasks_provider.dart';

class TaskDetailScreen extends ConsumerStatefulWidget {
  final Task task;
  final String listId;

  const TaskDetailScreen({super.key, required this.task, required this.listId});

  @override
  ConsumerState<TaskDetailScreen> createState() => _TaskDetailScreenState();
}

class _TaskDetailScreenState extends ConsumerState<TaskDetailScreen> {
  late TextEditingController _titleCtrl;
  late TextEditingController _notesCtrl;
  late bool _completed;
  late TaskPriority _priority;
  late DateTime? _dueDate;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _titleCtrl = TextEditingController(text: widget.task.title);
    _notesCtrl = TextEditingController(text: widget.task.description ?? '');
    _completed = widget.task.completed;
    _priority = widget.task.priority;
    _dueDate = widget.task.dueDate;
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _notesCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (_saving) return;
    setState(() => _saving = true);
    final service = ref.read(backendServiceProvider);
    final result = await service.updateTask(
      widget.task.id,
      title: _titleCtrl.text.trim().isNotEmpty ? _titleCtrl.text.trim() : null,
      description: _notesCtrl.text.trim(),
      completed: _completed,
      dueDate: _dueDate,
      clearDueDate: _dueDate == null && widget.task.dueDate != null,
      priority: _priority.name,
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (result != null) {
      ref.invalidate(tasksProvider(widget.listId));
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(AppLocalizations.of(context)!.savedChanges)),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!.errorSavingChanges),
          backgroundColor: Theme.of(context).colorScheme.error,
        ),
      );
    }
  }

  Future<void> _delete() async {
    final l10n = AppLocalizations.of(context)!;
    final confirmed = await showDialog<bool>(
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
    if (confirmed != true) return;
    final service = ref.read(backendServiceProvider);
    await service.deleteTask(widget.task.id);
    if (!mounted) return;
    ref.invalidate(tasksProvider(widget.listId));
    Navigator.pop(context);
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now(),
      firstDate: DateTime(2020),
      lastDate: DateTime(2100),
    );
    if (picked != null) setState(() => _dueDate = picked);
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.task),
        actions: [
          if (_saving)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.check),
              tooltip: l10n.save,
              onPressed: _save,
            ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            tooltip: l10n.deleteTask,
            onPressed: _delete,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Title ──────────────────────────────────────────────────────
            TextField(
              controller: _titleCtrl,
              style: theme.textTheme.titleLarge,
              decoration: InputDecoration(
                labelText: l10n.taskTitle,
                border: const OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.sentences,
              maxLines: 2,
              minLines: 1,
            ),
            const SizedBox(height: 20),

            // ── Completed toggle ───────────────────────────────────────────
            Row(
              children: [
                Checkbox(
                  value: _completed,
                  onChanged: (v) => setState(() => _completed = v ?? false),
                ),
                const SizedBox(width: 8),
                Text(
                  _completed ? l10n.complete : l10n.incomplete,
                  style: theme.textTheme.bodyLarge,
                ),
              ],
            ),
            const SizedBox(height: 20),

            // ── Due date ───────────────────────────────────────────────────
            Text(l10n.dueDate, style: theme.textTheme.labelLarge),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    icon: const Icon(Icons.calendar_today_outlined, size: 18),
                    label: Text(
                      _dueDate != null
                          ? _dueDate!.toLocal().toString().split(' ')[0]
                          : l10n.noDueDate,
                    ),
                    onPressed: _pickDate,
                  ),
                ),
                if (_dueDate != null) ...[
                  const SizedBox(width: 8),
                  IconButton(
                    icon: const Icon(Icons.clear),
                    tooltip: l10n.clearDate,
                    onPressed: () => setState(() => _dueDate = null),
                  ),
                ],
              ],
            ),
            const SizedBox(height: 20),

            // ── Priority ───────────────────────────────────────────────────
            Text(l10n.priority, style: theme.textTheme.labelLarge),
            const SizedBox(height: 8),
            SegmentedButton<TaskPriority>(
              segments: [
                ButtonSegment(
                  value: TaskPriority.low,
                  label: Text(l10n.priorityLow),
                  icon: const Icon(Icons.arrow_downward, size: 16),
                ),
                ButtonSegment(
                  value: TaskPriority.medium,
                  label: Text(l10n.priorityMedium),
                  icon: const Icon(Icons.remove, size: 16),
                ),
                ButtonSegment(
                  value: TaskPriority.high,
                  label: Text(l10n.priorityHigh),
                  icon: const Icon(Icons.arrow_upward, size: 16),
                ),
              ],
              selected: {
                _priority == TaskPriority.none ? TaskPriority.low : _priority,
              },
              onSelectionChanged: (s) =>
                  setState(() => _priority = s.first),
              emptySelectionAllowed: false,
            ),
            const SizedBox(height: 20),

            // ── Notes ──────────────────────────────────────────────────────
            TextField(
              controller: _notesCtrl,
              decoration: InputDecoration(
                labelText: l10n.notes,
                border: const OutlineInputBorder(),
                alignLabelWithHint: true,
              ),
              maxLines: 6,
              minLines: 3,
              textCapitalization: TextCapitalization.sentences,
            ),
            const SizedBox(height: 32),

            // ── Save button ────────────────────────────────────────────────
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _saving ? null : _save,
                child: Text(l10n.save),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
