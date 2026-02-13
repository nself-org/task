'use client';

import { useMemo } from 'react';
import { useAllTodos } from '@/hooks/use-all-todos';
import { AppHeader } from '@/components/layout/app-header';
import { TodoItem } from '@/components/todos/todo-item';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { isBefore, startOfDay, formatDistanceToNow } from 'date-fns';
import type { UpdateTodoInput } from '@/lib/types/todos';
import { todoService } from '@/lib/services/todos';
import { toast } from 'sonner';

export default function OverduePage() {
  const { todos: allTodos, loading, error, toggleTodo, updateTodo, deleteTodo, refetch } = useAllTodos();

  const overdueTodos = useMemo(() => {
    return allTodos
      .filter((todo) => {
        if (!todo.due_date || todo.completed) return false;
        return isBefore(new Date(todo.due_date), startOfDay(new Date()));
      })
      .sort((a, b) => {
        // Sort by due date (earliest overdue first)
        return new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime();
      });
  }, [allTodos]);

  // Todo operation handlers
  const handleToggleTodo = async (id: string) => {
    try {
      await toggleTodo(id);
      toast.success('Todo updated');
    } catch {
      toast.error('Failed to update todo');
    }
  };

  const handleUpdateTodo = async (id: string, input: UpdateTodoInput) => {
    try {
      await updateTodo(id, input);
      toast.success('Todo updated');
    } catch {
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (id: string) => {
    try {
      await deleteTodo(id);
      toast.success('Todo deleted');
    } catch {
      toast.error('Failed to delete todo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <Skeleton className="mb-6 h-12 w-64" />
          <Skeleton className="mb-4 h-32 w-full" />
          <Skeleton className="mb-4 h-32 w-full" />
          <Skeleton className="mb-4 h-32 w-full" />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Todos</AlertTitle>
            <AlertDescription>
              {error.message || 'Failed to load todos. Please try refreshing the page.'}
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive text-destructive-foreground">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Overdue</h1>
            <p className="text-muted-foreground">
              Tasks that are past their due date
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overdue Tasks</CardTitle>
            <CardDescription>
              {overdueTodos.length === 0
                ? 'No overdue tasks'
                : `${overdueTodos.length} ${overdueTodos.length === 1 ? 'task' : 'tasks'} overdue`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {overdueTodos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertTriangle className="mb-4 h-16 w-16 text-muted-foreground/50" />
                <p className="text-lg font-medium text-muted-foreground">
                  No overdue tasks
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Great job staying on top of your work! Keep it up.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {overdueTodos.map((todo) => (
                  <div key={todo.id} className="rounded-lg border border-destructive/30 p-3">
                    <div className="mb-2 flex items-center gap-2 text-sm text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">
                        Overdue by {formatDistanceToNow(new Date(todo.due_date!))}
                      </span>
                    </div>
                    <TodoItem
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onUpdate={handleUpdateTodo}
                      onDelete={handleDeleteTodo}
                      onTogglePublic={async (id) => {
                        try {
                          await todoService.togglePublic(id);
                          toast.success('Visibility updated');
                          refetch();
                        } catch {
                          toast.error('Failed to update visibility');
                        }
                      }}
                      onShare={async (todoId, email, permission) => {
                        try {
                          await todoService.shareTodo({ todo_id: todoId, shared_with_email: email, permission });
                          toast.success('Todo shared');
                        } catch {
                          toast.error('Failed to share todo');
                        }
                      }}
                      onRemoveShare={async (shareId) => {
                        try {
                          await todoService.removeShare(shareId);
                          toast.success('Share removed');
                        } catch {
                          toast.error('Failed to remove share');
                        }
                      }}
                      getShares={(todoId) => todoService.getShares(todoId)}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
