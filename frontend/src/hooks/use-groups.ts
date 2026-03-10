import { useState, useEffect, useCallback } from 'react';
import { groupService } from '@/lib/services/groups';
import { toast } from 'sonner';
import type { ListGroup, CreateListGroupInput, UpdateListGroupInput } from '@/lib/types/lists';

export function useGroups() {
  const [groups, setGroups] = useState<ListGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load groups';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = useCallback(async (input: CreateListGroupInput): Promise<ListGroup | null> => {
    try {
      const group = await groupService.createGroup(input);
      setGroups((prev) => [...prev, group]);
      toast.success('Group created');
      return group;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create group');
      return null;
    }
  }, []);

  const updateGroup = useCallback(async (id: string, input: UpdateListGroupInput): Promise<boolean> => {
    try {
      const updated = await groupService.updateGroup(id, input);
      setGroups((prev) => prev.map((g) => (g.id === id ? updated : g)));
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update group');
      return false;
    }
  }, []);

  const deleteGroup = useCallback(async (id: string): Promise<boolean> => {
    try {
      await groupService.deleteGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      toast.success('Group deleted');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete group');
      return false;
    }
  }, []);

  return {
    groups,
    loading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
}
