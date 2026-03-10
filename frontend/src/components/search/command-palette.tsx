'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, CheckSquare, List, Calendar, Settings, Circle } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAllTodos } from '@/hooks/use-all-todos';
import { useLists } from '@/hooks/use-lists';
import { cn } from '@/lib/utils';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { todos } = useAllTodos();
  const { lists } = useLists();
  const [query, setQuery] = useState('');

  // Reset query when closed
  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  const matchedTodos = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return todos
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
      .slice(0, 8);
  }, [todos, query]);

  const matchedLists = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return lists.filter((l) => l.title.toLowerCase().includes(q)).slice(0, 5);
  }, [lists, query]);

  const navigate = (path: string) => {
    router.push(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tasks, lists, and pages..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation shortcuts (always shown when no query) */}
        {!query && (
          <CommandGroup heading="Go to">
            <CommandItem onSelect={() => navigate('/dashboard')}>
              <CheckSquare className="mr-2 h-4 w-4" />
              My Tasks
            </CommandItem>
            <CommandItem onSelect={() => navigate('/lists')}>
              <List className="mr-2 h-4 w-4" />
              All Lists
            </CommandItem>
            <CommandItem onSelect={() => navigate('/today')}>
              <Calendar className="mr-2 h-4 w-4" />
              Today
            </CommandItem>
            <CommandItem onSelect={() => navigate('/calendar')}>
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </CommandItem>
            <CommandItem onSelect={() => navigate('/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandGroup>
        )}

        {/* Matching todos */}
        {matchedTodos.length > 0 && (
          <>
            {!query && <CommandSeparator />}
            <CommandGroup heading="Tasks">
              {matchedTodos.map((todo) => (
                <CommandItem
                  key={todo.id}
                  value={`todo-${todo.id}-${todo.title}`}
                  onSelect={() => navigate(`/todo/${todo.id}`)}
                >
                  <Circle
                    className={cn(
                      'mr-2 h-4 w-4 shrink-0',
                      todo.completed ? 'fill-green-500 text-green-500' : 'text-muted-foreground'
                    )}
                  />
                  <span className={cn('flex-1 truncate', todo.completed && 'line-through text-muted-foreground')}>
                    {todo.title}
                  </span>
                  {todo.priority && todo.priority !== 'none' && (
                    <span className="ml-2 text-xs text-muted-foreground">{todo.priority}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Matching lists */}
        {matchedLists.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Lists">
              {matchedLists.map((list) => (
                <CommandItem
                  key={list.id}
                  value={`list-${list.id}-${list.title}`}
                  onSelect={() => navigate(`/lists/${list.id}`)}
                >
                  <span
                    className="mr-2 h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: list.color }}
                  />
                  {list.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
