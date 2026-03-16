enum TaskPriority { none, low, medium, high }

class Task {
  final String id;
  final String title;
  final String? description;
  final bool completed;
  final DateTime? dueDate;
  final String listId;
  final String? assigneeId;
  final int position;
  final List<String> tags;
  final TaskPriority priority;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Task({
    required this.id,
    required this.title,
    this.description,
    this.completed = false,
    this.dueDate,
    required this.listId,
    this.assigneeId,
    required this.position,
    this.tags = const [],
    this.priority = TaskPriority.none,
    required this.createdAt,
    required this.updatedAt,
  });

  Task copyWith({
    String? title,
    String? description,
    bool? completed,
    DateTime? dueDate,
    bool clearDueDate = false,
    List<String>? tags,
    TaskPriority? priority,
  }) =>
      Task(
        id: id,
        title: title ?? this.title,
        description: description ?? this.description,
        completed: completed ?? this.completed,
        dueDate: clearDueDate ? null : (dueDate ?? this.dueDate),
        listId: listId,
        assigneeId: assigneeId,
        position: position,
        tags: tags ?? this.tags,
        priority: priority ?? this.priority,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );

  factory Task.fromJson(Map<String, dynamic> json) => Task(
        id: json['id'] as String,
        title: json['title'] as String,
        description: json['description'] as String?,
        completed: json['completed'] as bool? ?? false,
        dueDate:
            json['due_date'] != null ? DateTime.parse(json['due_date'] as String) : null,
        listId: json['list_id'] as String,
        assigneeId: json['assignee_id'] as String?,
        position: json['position'] as int? ?? 0,
        tags: (json['tags'] as List<dynamic>?)?.cast<String>() ?? [],
        priority: _priorityFromString(json['priority'] as String?),
        createdAt: DateTime.parse(json['created_at'] as String),
        updatedAt: DateTime.parse(json['updated_at'] as String),
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'description': description,
        'completed': completed,
        'due_date': dueDate?.toIso8601String(),
        'list_id': listId,
        'assignee_id': assigneeId,
        'position': position,
        'tags': tags,
        'priority': priority.name,
        'created_at': createdAt.toIso8601String(),
        'updated_at': updatedAt.toIso8601String(),
      };

  static TaskPriority _priorityFromString(String? s) {
    switch (s) {
      case 'low':
        return TaskPriority.low;
      case 'medium':
        return TaskPriority.medium;
      case 'high':
        return TaskPriority.high;
      default:
        return TaskPriority.none;
    }
  }
}
