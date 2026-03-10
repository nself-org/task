'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Flag, Tag, X, Check, Loader2 } from 'lucide-react';
import type { Todo, UpdateTodoInput, TodoPriority } from '@/lib/types/todos';
import { useLists } from '@/hooks/use-lists';
import { cn } from '@/lib/utils';

interface TaskDetailDrawerProps {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<void>;
}

const PRIORITY_OPTIONS: { value: TodoPriority; label: string; color: string }[] = [
  { value: 'none', label: 'No priority', color: 'text-muted-foreground' },
  { value: 'low', label: 'Low', color: 'text-blue-500' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
  { value: 'high', label: 'High', color: 'text-red-500' },
];

export function TaskDetailDrawer({ todo, open, onOpenChange, onUpdate }: TaskDetailDrawerProps) {
  const { lists } = useLists();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('none');
  const [listId, setListId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [titleDirty, setTitleDirty] = useState(false);
  const [notesDirty, setNotesDirty] = useState(false);

  // Sync state when todo changes
  useEffect(() => {
    if (!todo) return;
    setTitle(todo.title);
    setNotes(todo.notes || '');
    setDueDate(todo.due_date ? todo.due_date.slice(0, 10) : '');
    setPriority(todo.priority || 'none');
    setListId(todo.list_id || '');
    setTags(todo.tags || []);
    setTitleDirty(false);
    setNotesDirty(false);
  }, [todo]);

  if (!todo) return null;

  async function save(updates: UpdateTodoInput) {
    if (!todo) return;
    setSaving(true);
    try {
      await onUpdate(todo.id, updates);
    } finally {
      setSaving(false);
    }
  }

  async function handleTitleBlur() {
    if (!titleDirty || !title.trim() || title === todo?.title) return;
    await save({ title: title.trim() });
    setTitleDirty(false);
  }

  async function handleNotesBlur() {
    if (!notesDirty || notes === (todo?.notes || '')) return;
    await save({ notes: notes || null });
    setNotesDirty(false);
  }

  async function handleDueDateChange(value: string) {
    setDueDate(value);
    await save({ due_date: value || null });
  }

  async function handlePriorityChange(value: TodoPriority) {
    setPriority(value);
    await save({ priority: value });
  }

  async function handleListChange(value: string) {
    setListId(value);
    await save({ list_id: value === '_none' ? undefined : value });
  }

  async function handleAddTag() {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (!tag || tags.includes(tag)) {
      setTagInput('');
      return;
    }
    const next = [...tags, tag];
    setTags(next);
    setTagInput('');
    await save({ tags: next });
  }

  async function handleRemoveTag(tag: string) {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    await save({ tags: next });
  }

  const priorityColor = PRIORITY_OPTIONS.find((p) => p.value === priority)?.color;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-lg" side="right">
        <SheetHeader className="pb-4">
          <SheetTitle className="sr-only">Task details</SheetTitle>
        </SheetHeader>

        {/* Saving indicator */}
        {saving && (
          <div className="flex items-center gap-1.5 pb-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Saving...
          </div>
        )}

        {/* Title */}
        <div className="pb-4">
          <Input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setTitleDirty(true); }}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
            className="border-0 px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
            placeholder="Task title"
          />
        </div>

        <Separator />

        {/* Fields grid */}
        <div className="space-y-4 py-4">
          {/* Due date */}
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Due date</p>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="flex items-start gap-3">
            <Flag className={cn('mt-0.5 h-4 w-4 shrink-0', priorityColor)} />
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Priority</p>
              <Select value={priority} onValueChange={(v) => handlePriorityChange(v as TodoPriority)}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className={p.color}>{p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* List */}
          {lists.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded bg-muted" />
              <div className="flex-1">
                <p className="mb-1 text-xs font-medium text-muted-foreground">List</p>
                <Select value={listId || '_none'} onValueChange={handleListChange}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="No list" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No list</SelectItem>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: list.color }}
                          />
                          {list.title}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex items-start gap-3">
            <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 pr-1 text-xs"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-0.5 rounded-sm opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                <div className="flex items-center gap-1">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag..."
                    className="h-6 w-24 border-0 px-1 text-xs shadow-none focus-visible:ring-1"
                  />
                  {tagInput && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleAddTag}>
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div className="flex-1 py-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Notes</p>
          <Textarea
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setNotesDirty(true); }}
            onBlur={handleNotesBlur}
            placeholder="Add notes..."
            className="min-h-[160px] resize-none border-0 px-0 shadow-none focus-visible:ring-0"
          />
        </div>

        {/* Meta */}
        <div className="border-t pt-3 text-xs text-muted-foreground">
          <p>Created {format(new Date(todo.created_at), 'MMM d, yyyy')}</p>
          {todo.updated_at && (
            <p>Updated {format(new Date(todo.updated_at), 'MMM d, yyyy')}</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
