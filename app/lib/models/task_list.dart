class TaskList {
  final String id;
  final String title;
  final String? description;
  final String color;
  final int position;
  final String ownerId;
  final DateTime createdAt;
  final DateTime updatedAt;

  const TaskList({
    required this.id,
    required this.title,
    this.description,
    this.color = '#6366F1',
    required this.position,
    required this.ownerId,
    required this.createdAt,
    required this.updatedAt,
  });

  factory TaskList.fromJson(Map<String, dynamic> json) => TaskList(
    id: json['id'] as String,
    title: json['title'] as String,
    description: json['description'] as String?,
    color: json['color'] as String? ?? '#6366F1',
    position: json['position'] as int? ?? 0,
    ownerId: json['owner_id'] as String,
    createdAt: DateTime.parse(json['created_at'] as String),
    updatedAt: DateTime.parse(json['updated_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'title': title,
    'description': description,
    'color': color,
    'position': position,
    'owner_id': ownerId,
    'created_at': createdAt.toIso8601String(),
    'updated_at': updatedAt.toIso8601String(),
  };
}
