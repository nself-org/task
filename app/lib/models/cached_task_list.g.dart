// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cached_task_list.dart';

class CachedTaskListAdapter extends TypeAdapter<CachedTaskList> {
  @override
  final int typeId = 0;

  @override
  CachedTaskList read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CachedTaskList()
      ..id = fields[0] as String
      ..title = fields[1] as String
      ..description = fields[2] as String?
      ..color = fields[3] as String
      ..position = fields[4] as int
      ..ownerId = fields[5] as String
      ..createdAt = fields[6] as String
      ..updatedAt = fields[7] as String;
  }

  @override
  void write(BinaryWriter writer, CachedTaskList obj) {
    writer
      ..writeByte(8)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.title)
      ..writeByte(2)
      ..write(obj.description)
      ..writeByte(3)
      ..write(obj.color)
      ..writeByte(4)
      ..write(obj.position)
      ..writeByte(5)
      ..write(obj.ownerId)
      ..writeByte(6)
      ..write(obj.createdAt)
      ..writeByte(7)
      ..write(obj.updatedAt);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CachedTaskListAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;

  @override
  int get hashCode => typeId.hashCode;
}
