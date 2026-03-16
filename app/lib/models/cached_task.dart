import 'package:hive/hive.dart';

part 'cached_task.g.dart';

@HiveType(typeId: 1)
class CachedTask extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late String title;

  @HiveField(2)
  String? description;

  @HiveField(3)
  late bool completed;

  @HiveField(4)
  String? dueDate;

  @HiveField(5)
  late String listId;

  @HiveField(6)
  late int position;

  @HiveField(7)
  late String createdAt;

  @HiveField(8)
  late String updatedAt;
}
