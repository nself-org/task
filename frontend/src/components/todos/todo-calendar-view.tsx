'use client';

import { useMemo, useState } from 'react';
import { useTodos } from '@/hooks/use-todos';
import { TaskDetailDrawer } from './task-detail-drawer';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/providers/auth-provider';
import { useListPresence } from '@/hooks/use-list-presence';
import { useCallback } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns';
import { cn } from '@/lib/utils';
import type { Todo, UpdateTodoInput, TodoFilters } from '@/lib/types/todos';

interface TodoCalendarViewProps {
  listId?: string;
  search?: string;
  filters?: TodoFilters;
}

export function TodoCalendarView({ listId, search = '', filters }: TodoCalendarViewProps) {
  const { todos, loading, error, updateTodo } = useTodos(listId);
  const { updateStatus } = useListPresence(listId ?? null);
  useAuth(); // establishes auth context

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [drawerTodo, setDrawerTodo] = useState<Todo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenDrawer = useCallback(
    (todo: Todo) => {
      setDrawerTodo(todo);
      setDrawerOpen(true);
      updateStatus('editing', todo.id);
    },
    [updateStatus]
  );

  const handleDrawerOpenChange = useCallback(
    (open: boolean) => {
      setDrawerOpen(open);
      if (!open) updateStatus('viewing', null);
    },
    [updateStatus]
  );

  const handleUpdateTodo = async (id: string, input: UpdateTodoInput) => {
    await updateTodo(id, input);
  };

  const visibleTodos = useMemo(() => {
    let filtered = todos.filter((t) => t.due_date !== null);

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes?.toLowerCase().includes(q)
      );
    }

    if (filters?.completed !== undefined) {
      filtered = filtered.filter((t) => t.completed === filters.completed);
    }
    if (filters?.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    return filtered;
  }, [todos, search, filters]);

  // Build calendar grid: 6 weeks x 7 days covering the visible month
  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const todosByDay = useMemo(() => {
    const map: Record<string, Todo[]> = {};
    for (const day of calendarDays) {
      const key = format(day, 'yyyy-MM-dd');
      map[key] = visibleTodos.filter((t) => isSameDay(new Date(t.due_date!), day));
    }
    return map;
  }, [visibleTodos, calendarDays]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Month navigation */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[140px] text-center font-medium">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => setCurrentMonth(new Date())}
        >
          Today
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-1">
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayTodos = todosByDay[key] ?? [];
              const inMonth = isSameMonth(day, currentMonth);
              const todayDay = isToday(day);

              return (
                <div
                  key={key}
                  className={cn(
                    'min-h-[96px] rounded-md border p-1',
                    !inMonth && 'bg-muted/30 opacity-50',
                    todayDay && 'border-primary'
                  )}
                >
                  {/* Day number */}
                  <div
                    className={cn(
                      'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs',
                      todayDay && 'bg-primary font-bold text-primary-foreground'
                    )}
                  >
                    {format(day, 'd')}
                  </div>

                  {/* Tasks */}
                  <div className="space-y-0.5">
                    {dayTodos.slice(0, 3).map((todo) => (
                      <button
                        key={todo.id}
                        type="button"
                        onClick={() => handleOpenDrawer(todo)}
                        className={cn(
                          'w-full truncate rounded px-1 py-0.5 text-left text-xs transition-colors hover:opacity-80',
                          todo.completed
                            ? 'bg-green-500/20 text-green-700 line-through dark:text-green-400'
                            : todo.priority === 'high'
                            ? 'bg-red-500/20 text-red-700 dark:text-red-400'
                            : todo.priority === 'medium'
                            ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        {todo.title}
                      </button>
                    ))}
                    {dayTodos.length > 3 && (
                      <div className="px-1 text-xs text-muted-foreground">
                        +{dayTodos.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <TaskDetailDrawer
        todo={drawerTodo}
        open={drawerOpen}
        onOpenChange={handleDrawerOpenChange}
        onUpdate={handleUpdateTodo}
      />
    </div>
  );
}
