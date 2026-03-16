// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cached_task.dart';

class CachedTaskAdapter extends TypeAdapter<CachedTask> {
  @override
  final int typeId = 1;

  @override
  CachedTask read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CachedTask()
      ..id = fields[0] as String
      ..title = fields[1] as String
      ..description = fields[2] as String?
      ..completed = fields[3] as bool
      ..dueDate = fields[4] as String?
      ..listId = fields[5] as String
      ..position = fields[6] as int
      ..createdAt = fields[7] as String
      ..updatedAt = fields[8] as String;
  }

  @override
  void write(BinaryWriter writer, CachedTask obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.title)
      ..writeByte(2)
      ..write(obj.description)
      ..writeByte(3)
      ..write(obj.completed)
      ..writeByte(4)
      ..write(obj.dueDate)
      ..writeByte(5)
      ..write(obj.listId)
      ..writeByte(6)
      ..write(obj.position)
      ..writeByte(7)
      ..write(obj.createdAt)
      ..writeByte(8)
      ..write(obj.updatedAt);
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CachedTaskAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;

  @override
  int get hashCode => typeId.hashCode;
}
