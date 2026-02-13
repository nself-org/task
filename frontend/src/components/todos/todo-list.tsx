'use client';

import { useMemo, useState, useCallback } from 'react';
import { useTodos } from '@/hooks/use-todos';
import { usePreferences } from '@/hooks/use-preferences';
import { useAuth } from '@/lib/providers/auth-provider';
import { useCanApprove } from '@/hooks/use-list-members';
import { TodoItem } from './todo-item';
import { CreateTodoForm } from './create-todo-form';
import { QuickAddTodo, QuickAddHelp } from './quick-add-todo';
import { BulkActionsToolbar } from './bulk-actions-toolbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { CreateTodoInput, UpdateTodoInput, TodoFilters, TodoSortOptions, TodoPriority } from '@/lib/types/todos';

interface TodoListProps {
  listId: string;
  search?: string;
  filters?: TodoFilters;
  sort?: TodoSortOptions;
}

export function TodoList({ listId, search = '', filters, sort }: TodoListProps) {
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    togglePublic,
    shareTodo,
    removeShare,
    getShares,
  } = useTodos(listId);

  const { preferences } = usePreferences();
  const { user } = useAuth();
  const { canApprove } = useCanApprove(listId, user?.id);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  // Filter and sort todos
  const visibleTodos = useMemo(() => {
    let filtered = [...todos];

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchLower) ||
          todo.notes?.toLowerCase().includes(searchLower) ||
          todo.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Apply filters
    if (filters) {
      // Status filter
      if (filters.completed !== undefined) {
        filtered = filtered.filter((todo) => todo.completed === filters.completed);
      }

      // Priority filter
      if (filters.priority) {
        filtered = filtered.filter((todo) => todo.priority === filters.priority);
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter((todo) =>
          todo.tags?.some((tag) => filters.tags!.includes(tag))
        );
      }

      // Due date filter
      if (filters.dueAfter || filters.dueBefore) {
        filtered = filtered.filter((todo) => {
          if (!todo.due_date) return false;
          const dueDate = new Date(todo.due_date);
          if (filters.dueAfter && dueDate < new Date(filters.dueAfter)) return false;
          if (filters.dueBefore && dueDate > new Date(filters.dueBefore)) return false;
          return true;
        });
      }
    }

    // Apply auto-hide completed preference
    if (preferences?.auto_hide_completed) {
      filtered = filtered.filter((todo) => !todo.completed);
    }

    // Apply sorting
    if (sort) {
      filtered.sort((a, b) => {
        let comparison = 0;

        switch (sort.field) {
          case 'position':
            comparison = (a.position || 0) - (b.position || 0);
            break;
          case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
          case 'due_date':
            if (!a.due_date && !b.due_date) comparison = 0;
            else if (!a.due_date) comparison = 1;
            else if (!b.due_date) comparison = -1;
            else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
            break;
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
            const aPriority = priorityOrder[a.priority || 'none'];
            const bPriority = priorityOrder[b.priority || 'none'];
            comparison = bPriority - aPriority; // High to Low
            break;
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          default:
            comparison = 0;
        }

        return sort.ascending === false ? -comparison : comparison;
      });
    }

    return filtered;
  }, [todos, search, filters, sort, preferences]);

  const handleCreateTodo = async (input: CreateTodoInput) => {
    await createTodo({ ...input, list_id: listId });
  };

  const handleToggleTodo = async (id: string) => {
    await toggleTodo(id);
  };

  const handleUpdateTodo = async (id: string, input: UpdateTodoInput) => {
    await updateTodo(id, input);
  };

  const handleDeleteTodo = async (id: string) => {
    await deleteTodo(id);
  };

  const handleTogglePublic = async (id: string) => {
    await togglePublic(id);
  };

  const handleShare = async (todoId: string, email: string, permission: 'view' | 'edit') => {
    await shareTodo({ todo_id: todoId, shared_with_email: email, permission });
  };

  const handleRemoveShare = async (shareId: string) => {
    await removeShare(shareId);
  };

  // Approval handlers
  const handleApprove = async (todoId: string) => {
    try {
      await updateTodo(todoId, { approved: true, rejected_by: null, rejection_reason: null });
      toast.success('Task approved');
    } catch (error) {
      toast.error('Failed to approve task');
      throw error;
    }
  };

  const handleReject = async (todoId: string, reason?: string) => {
    try {
      await updateTodo(todoId, {
        completed: false,
        approved: false,
        rejected_by: user?.id || null,
        rejection_reason: reason || null,
      });
      toast.success('Task rejected');
    } catch (error) {
      toast.error('Failed to reject task');
      throw error;
    }
  };

  // Selection handlers
  const handleSelectChange = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectionMode(false);
  }, []);

  const handleToggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    setSelectedIds(new Set());
  }, []);

  // Bulk operation handlers
  const handleBulkComplete = useCallback(async () => {
    const selectedTodos = visibleTodos.filter((todo) => selectedIds.has(todo.id));
    const incompleteTodos = selectedTodos.filter((todo) => !todo.completed);

    if (incompleteTodos.length === 0) {
      toast.info('All selected todos are already completed');
      return;
    }

    try {
      await Promise.all(incompleteTodos.map((todo) => updateTodo(todo.id, { completed: true })));
      toast.success(`Completed ${incompleteTodos.length} todo${incompleteTodos.length > 1 ? 's' : ''}`);
      handleClearSelection();
    } catch (error) {
      toast.error('Failed to complete todos');
    }
  }, [selectedIds, visibleTodos, updateTodo, handleClearSelection]);

  const handleBulkUncomplete = useCallback(async () => {
    const selectedTodos = visibleTodos.filter((todo) => selectedIds.has(todo.id));
    const completedTodos = selectedTodos.filter((todo) => todo.completed);

    if (completedTodos.length === 0) {
      toast.info('All selected todos are already incomplete');
      return;
    }

    try {
      await Promise.all(completedTodos.map((todo) => updateTodo(todo.id, { completed: false })));
      toast.success(`Uncompleted ${completedTodos.length} todo${completedTodos.length > 1 ? 's' : ''}`);
      handleClearSelection();
    } catch (error) {
      toast.error('Failed to uncomplete todos');
    }
  }, [selectedIds, visibleTodos, updateTodo, handleClearSelection]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.size} todo${selectedIds.size > 1 ? 's' : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await Promise.all(Array.from(selectedIds).map((id) => deleteTodo(id)));
      toast.success(`Deleted ${selectedIds.size} todo${selectedIds.size > 1 ? 's' : ''}`);
      handleClearSelection();
    } catch (error) {
      toast.error('Failed to delete todos');
    }
  }, [selectedIds, deleteTodo, handleClearSelection]);

  // Quick-add handler
  const handleQuickAdd = useCallback(async (title: string, priority?: TodoPriority) => {
    await createTodo({
      list_id: listId,
      title,
      priority: priority || 'none',
    });
  }, [listId, createTodo]);

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Todo</CardTitle>
          <CardDescription>Add a new task to your list</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTodoForm listId={listId} onSubmit={handleCreateTodo} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Todos</CardTitle>
              <CardDescription>
                {loading
                  ? 'Loading...'
                  : `${visibleTodos.length} ${visibleTodos.length === 1 ? 'task' : 'tasks'}${
                      preferences?.auto_hide_completed && todos.length !== visibleTodos.length
                        ? ` (${todos.length - visibleTodos.length} hidden)`
                        : ''
                    }`}
              </CardDescription>
            </div>
            {visibleTodos.length > 0 && (
              <Button
                variant={selectionMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleSelectionMode}
                className="gap-2"
              >
                <CheckSquare className="h-4 w-4" />
                {selectionMode ? 'Done' : 'Select'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quick-add input */}
            <QuickAddTodo onAdd={handleQuickAdd} placeholder="Quick add (try: Buy milk !1 for high priority)" />
            <QuickAddHelp />

            {loading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : visibleTodos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>
                  {todos.length === 0
                    ? 'No todos yet. Add your first task using quick-add above!'
                    : 'All tasks completed! 🎉'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggleTodo}
                  onUpdate={handleUpdateTodo}
                  onDelete={handleDeleteTodo}
                  onTogglePublic={handleTogglePublic}
                  onShare={handleShare}
                  onRemoveShare={handleRemoveShare}
                  getShares={getShares}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  canApprove={canApprove}
                  selected={selectedIds.has(todo.id)}
                  onSelectChange={handleSelectChange}
                  selectionMode={selectionMode}
                />
              ))}
            </div>
          )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk actions toolbar */}
      <BulkActionsToolbar
        selectedCount={selectedIds.size}
        onClearSelection={handleClearSelection}
        onBulkComplete={handleBulkComplete}
        onBulkUncomplete={handleBulkUncomplete}
        onBulkDelete={handleBulkDelete}
      />
    </div>
  );
}
