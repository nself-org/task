/**
 * List Members Service - Role-based access control for lists
 *
 * Handles:
 * - Adding members to lists (by email or user_id)
 * - Updating member roles
 * - Removing members from lists
 * - Checking user permissions
 */

import { getBackend } from '../backend';
import type { BackendClient } from '../types/backend';
import type { ListMember, AddListMemberInput, UpdateListMemberRoleInput, ListMemberRole } from '../types/list-members';
import { Tables } from '../utils/tables';

export class ListMembersService {
  private backend: BackendClient;

  constructor(backendAdapter: BackendClient) {
    this.backend = backendAdapter;
  }

  /**
   * Get all members for a list
   */
  async getListMembers(listId: string): Promise<ListMember[]> {
    const { data, error } = await this.backend.db.query<ListMember>(Tables.LIST_MEMBERS, {
      where: { list_id: listId },
      orderBy: [
        { column: 'role', ascending: true },
        { column: 'added_at', ascending: true },
      ],
    });

    if (error) throw new Error(error);
    return data || [];
  }

  /**
   * Get user's role in a list
   */
  async getUserRole(listId: string, userId: string): Promise<ListMemberRole | null> {
    const { data, error } = await this.backend.db.query<ListMember>(Tables.LIST_MEMBERS, {
      where: {
        list_id: listId,
        user_id: userId,
      },
      limit: 1,
    });

    if (error) throw new Error(error);
    if (!data || data.length === 0) return null;
    return data[0].role;
  }

  /**
   * Check if user can approve tasks in this list
   */
  async canApproveTasks(listId: string, userId: string): Promise<boolean> {
    const role = await this.getUserRole(listId, userId);
    return role === 'owner' || role === 'admin';
  }

  /**
   * Add a member to a list.
   * If user_id is provided, inserts directly into list_members.
   * If only email is provided, creates a share invitation via list_shares.
   */
  async addMember(input: AddListMemberInput): Promise<ListMember> {
    if (input.user_id) {
      const { data, error } = await this.backend.db.insert<ListMember>(Tables.LIST_MEMBERS, {
        list_id: input.list_id,
        user_id: input.user_id,
        role: input.role,
      });

      if (error) throw new Error(error);
      if (!data) throw new Error('Failed to add member');
      return data;
    }

    if (input.email) {
      const permissionMap: Record<string, string> = {
        owner: 'owner',
        admin: 'editor',
        member: 'viewer',
      };
      const { error } = await this.backend.db.insert(Tables.LIST_SHARES, {
        list_id: input.list_id,
        shared_with_email: input.email,
        permission: permissionMap[input.role] || 'viewer',
      });

      if (error) throw new Error(error);

      return {
        id: crypto.randomUUID(),
        list_id: input.list_id,
        user_id: '',
        role: input.role,
        added_by: '',
        added_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: '',
          email: input.email,
          display_name: input.email,
          avatar_url: null,
        },
      };
    }

    throw new Error('Either user_id or email is required');
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(memberId: string, input: UpdateListMemberRoleInput): Promise<ListMember> {
    const { data, error } = await this.backend.db.update<ListMember>(Tables.LIST_MEMBERS, memberId, {
      role: input.role,
    });

    if (error) throw new Error(error);
    if (!data) throw new Error('Failed to update member role');
    return data;
  }

  /**
   * Remove a member from a list
   */
  async removeMember(memberId: string): Promise<void> {
    const { error } = await this.backend.db.remove(Tables.LIST_MEMBERS, memberId);
    if (error) throw new Error(error);
  }

  /**
   * Leave a list (remove self as member)
   * Note: Cannot leave if you're the owner
   */
  async leaveList(listId: string, userId: string): Promise<void> {
    // First, get the member record
    const { data, error } = await this.backend.db.query<ListMember>(Tables.LIST_MEMBERS, {
      where: {
        list_id: listId,
        user_id: userId,
      },
      limit: 1,
    });

    if (error) throw new Error(error);
    if (!data || data.length === 0) {
      throw new Error('You are not a member of this list');
    }

    const member = data[0];

    if (member.role === 'owner') {
      throw new Error('Cannot leave list as owner. Transfer ownership first or delete the list.');
    }

    await this.removeMember(member.id);
  }
}

export const listMembersService = new ListMembersService(getBackend());
