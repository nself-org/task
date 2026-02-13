import { useState, useEffect, useCallback } from 'react';
import { listMembersService } from '@/lib/services/list-members';
import type { ListMember, AddListMemberInput, ListMemberRole } from '@/lib/types/list-members';
import { toast } from 'sonner';

/**
 * Hook to manage list members
 */
export function useListMembers(listId: string) {
  const [members, setMembers] = useState<ListMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listMembersService.getListMembers(listId);
      setMembers(data);
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to load list members');
    } finally {
      setLoading(false);
    }
  }, [listId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const addMember = useCallback(async (input: AddListMemberInput) => {
    try {
      const newMember = await listMembersService.addMember(input);
      setMembers((prev) => [...prev, newMember]);
      toast.success('Member added');
      return newMember;
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  }, []);

  const updateMemberRole = useCallback(async (memberId: string, role: ListMemberRole) => {
    try {
      const updated = await listMembersService.updateMemberRole(memberId, { role });
      setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
      toast.success('Member role updated');
      return updated;
    } catch (err) {
      toast.error('Failed to update role');
      throw err;
    }
  }, []);

  const removeMember = useCallback(async (memberId: string) => {
    try {
      await listMembersService.removeMember(memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      toast.success('Member removed');
    } catch (err) {
      toast.error('Failed to remove member');
      throw err;
    }
  }, []);

  const leaveList = useCallback(async (userId: string) => {
    try {
      await listMembersService.leaveList(listId, userId);
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      toast.success('Left list');
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  }, [listId]);

  return {
    members,
    loading,
    error,
    addMember,
    updateMemberRole,
    removeMember,
    leaveList,
    refetch: fetchMembers,
  };
}

/**
 * Hook to get user's role in a list
 */
export function useUserRole(listId: string, userId: string | undefined) {
  const [role, setRole] = useState<ListMemberRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRole(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    listMembersService
      .getUserRole(listId, userId)
      .then((userRole) => {
        if (mounted) {
          setRole(userRole);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setRole(null);
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [listId, userId]);

  return { role, loading };
}

/**
 * Hook to check if user can approve tasks
 */
export function useCanApprove(listId: string, userId: string | undefined) {
  const { role, loading } = useUserRole(listId, userId);
  const canApprove = role === 'owner' || role === 'admin';
  return { canApprove, role, loading };
}
