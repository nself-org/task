'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { TodoItem } from './todo-item';
import type { Todo, UpdateTodoInput, TodoShare } from '@/lib/types/todos';

interface SortableTodoItemProps {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePublic: (id: string) => Promise<void>;
  onShare: (id: string, email: string, permission: 'view' | 'edit') => Promise<void>;
  onRemoveShare: (shareId: string) => Promise<void>;
  getShares: (todoId: string) => Promise<TodoShare[]>;
  onApprove?: (todoId: string) => Promise<void>;
  onReject?: (todoId: string, reason?: string) => Promise<void>;
  canApprove?: boolean;
  onDetailOpen?: (todo: Todo) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
}

export function SortableTodoItem({ todo, ...props }: SortableTodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex items-start gap-1 group">
      <button
        type="button"
        className="mt-3 shrink-0 cursor-grab touch-none p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <TodoItem todo={todo} {...props} />
      </div>
    </div>
  );
}
