import 'package:hive/hive.dart';

part 'cached_task_list.g.dart';

@HiveType(typeId: 0)
class CachedTaskList extends HiveObject {
  @HiveField(0)
  late String id;

  @HiveField(1)
  late String title;

  @HiveField(2)
  String? description;

  @HiveField(3)
  late String color;

  @HiveField(4)
  late int position;

  @HiveField(5)
  late String ownerId;

  @HiveField(6)
  late String createdAt;

  @HiveField(7)
  late String updatedAt;
}
