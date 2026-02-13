import { useState, useEffect, useCallback } from 'react';
import { todoService } from '@/lib/services/todos';
import type { Todo, UpdateTodoInput } from '@/lib/types/todos';

/**
 * Hook to fetch all todos across all user's lists
 * Used for Today/Overdue/Calendar views
 */
export function useAllTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await todoService.getAllUserTodos();
      setTodos(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const toggleTodo = useCallback(async (id: string) => {
    try {
      const updated = await todoService.toggleTodo(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (id: string, input: UpdateTodoInput) => {
    try {
      const updated = await todoService.updateTodo(id, input);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (err) {
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      await todoService.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    todos,
    loading,
    error,
    toggleTodo,
    updateTodo,
    deleteTodo,
    refetch: fetchTodos,
  };
}
