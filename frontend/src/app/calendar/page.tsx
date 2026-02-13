'use client';

import { useMemo, useState } from 'react';
import { useAllTodos } from '@/hooks/use-all-todos';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const { todos: allTodos, loading, error } = useAllTodos();

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 0 }); // Sunday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 0 });
  const daysInWeek = useMemo(
    () => eachDayOfInterval({ start: weekStart, end: weekEnd }),
    [weekStart.getTime(), weekEnd.getTime()]
  );

  const todosByDay = useMemo(() => {
    const grouped: Record<string, typeof allTodos> = {};

    daysInWeek.forEach((day) => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = allTodos.filter((todo) => {
        if (!todo.due_date) return false;
        return isSameDay(new Date(todo.due_date), day);
      });
    });

    return grouped;
  }, [allTodos, daysInWeek]);

  const handlePreviousWeek = () => {
    setCurrentWeek((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek((prev) => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeek(new Date());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Skeleton className="mb-6 h-12 w-64" />
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CalendarIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Calendar</h1>
                <p className="text-muted-foreground">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {daysInWeek.map((day) => {
            const dayKey = format(day, 'yyyy-MM-dd');
            const dayTodos = todosByDay[dayKey] || [];
            const today = isToday(day);

            return (
              <Card
                key={dayKey}
                className={cn(
                  'flex flex-col',
                  today && 'border-primary bg-primary/5'
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {format(day, 'EEE')}
                      </CardTitle>
                      <CardDescription className={cn(
                        "text-2xl font-bold",
                        today && "text-primary"
                      )}>
                        {format(day, 'd')}
                      </CardDescription>
                    </div>
                    {dayTodos.length > 0 && (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                        {dayTodos.length}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  {dayTodos.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      No tasks
                    </p>
                  ) : (
                    dayTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="rounded-md border p-2 text-sm hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={cn(
                              'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                              todo.completed ? 'bg-green-500' : 'bg-blue-500'
                            )}
                          />
                          <p className={cn(
                            'flex-1 line-clamp-2',
                            todo.completed && 'line-through text-muted-foreground'
                          )}>
                            {todo.title}
                          </p>
                        </div>
                        {todo.list && (
                          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: todo.list.color }}
                            />
                            {todo.list.title}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
}
