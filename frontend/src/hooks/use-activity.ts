'use client';

import { useState, useEffect, useCallback } from 'react';
import { useBackend } from '@/lib/providers/backend-provider';
import { Tables } from '@/lib/utils/tables';
import type { TodoActivity } from '@/lib/types/todos';

export function useActivity(todoId: string | null) {
  const backend = useBackend();
  const [activities, setActivities] = useState<TodoActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    if (!todoId) return;
    setLoading(true);
    try {
      const { data } = await backend.db.query<TodoActivity>(Tables.ACTIVITY, {
        where: { todo_id: todoId },
        orderBy: [{ column: 'created_at', ascending: false }],
        limit: 50,
      });
      setActivities(data ?? []);
    } catch {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [todoId, backend]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  return { activities, loading, refetch: fetchActivities };
}
