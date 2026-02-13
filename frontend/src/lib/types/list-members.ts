/**
 * List Members Types - Role-based access control for lists
 *
 * Roles:
 * - owner: Full control, can delete list, manage all members, approve tasks
 * - admin: Can manage members (except owner), approve tasks
 * - member: Can create and complete tasks, cannot approve
 */

export type ListMemberRole = 'owner' | 'admin' | 'member';

export interface ListMember {
  id: string;
  list_id: string;
  user_id: string;
  role: ListMemberRole;
  added_by: string;
  added_at: string;
  created_at: string;
  updated_at: string;

  // Joined user data
  user?: {
    id: string;
    email: string;
    display_name: string;
    avatar_url: string | null;
  };

  added_by_user?: {
    id: string;
    email: string;
    display_name: string;
  };
}

export interface AddListMemberInput {
  list_id: string;
  user_id?: string; // If user already registered
  email?: string; // If inviting by email
  role: ListMemberRole;
}

export interface UpdateListMemberRoleInput {
  role: ListMemberRole;
}

/**
 * Role Permission Matrix
 *
 * | Action                  | Owner | Admin | Member |
 * |-------------------------|-------|-------|--------|
 * | View list               | ✓     | ✓     | ✓      |
 * | Create todos            | ✓     | ✓     | ✓      |
 * | Complete todos          | ✓     | ✓     | ✓      |
 * | Upload completion photo | ✓     | ✓     | ✓      |
 * | Edit own todos          | ✓     | ✓     | ✓      |
 * | Approve tasks           | ✓     | ✓     | ✗      |
 * | Reject tasks            | ✓     | ✓     | ✗      |
 * | Delete any todo         | ✓     | ✓     | ✗      |
 * | Edit list details       | ✓     | ✓     | ✗      |
 * | Add members             | ✓     | ✓     | ✗      |
 * | Change member roles     | ✓     | ✗     | ✗      |
 * | Remove members          | ✓     | ✗     | ✗      |
 * | Delete list             | ✓     | ✗     | ✗      |
 */
export const ROLE_PERMISSIONS = {
  owner: {
    can_view: true,
    can_create_todos: true,
    can_complete_todos: true,
    can_approve_tasks: true,
    can_reject_tasks: true,
    can_delete_any_todo: true,
    can_edit_list: true,
    can_add_members: true,
    can_change_roles: true,
    can_remove_members: true,
    can_delete_list: true,
  },
  admin: {
    can_view: true,
    can_create_todos: true,
    can_complete_todos: true,
    can_approve_tasks: true,
    can_reject_tasks: true,
    can_delete_any_todo: true,
    can_edit_list: true,
    can_add_members: true,
    can_change_roles: false,
    can_remove_members: false,
    can_delete_list: false,
  },
  member: {
    can_view: true,
    can_create_todos: true,
    can_complete_todos: true,
    can_approve_tasks: false,
    can_reject_tasks: false,
    can_delete_any_todo: false,
    can_edit_list: false,
    can_add_members: false,
    can_change_roles: false,
    can_remove_members: false,
    can_delete_list: false,
  },
} as const;

/**
 * Helper to check if a role has a specific permission
 */
export function hasPermission(role: ListMemberRole, permission: keyof typeof ROLE_PERMISSIONS.owner): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: ListMemberRole) {
  return ROLE_PERMISSIONS[role];
}
