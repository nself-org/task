'use client';

import { useState } from 'react';
import { useListMembers } from '@/hooks/use-list-members';
import type { ListMemberRole } from '@/lib/types/list-members';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, Trash2, Crown, Shield, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ListMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  listTitle: string;
  currentUserId?: string;
}

const roleIcons = {
  owner: Crown,
  admin: Shield,
  member: User,
};

const roleColors = {
  owner: 'text-yellow-600 dark:text-yellow-400',
  admin: 'text-blue-600 dark:text-blue-400',
  member: 'text-gray-600 dark:text-gray-400',
};

const roleLabels = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};

export function ListMembersDialog({
  open,
  onOpenChange,
  listId,
  listTitle,
  currentUserId,
}: ListMembersDialogProps) {
  const { members, loading, addMember, updateMemberRole, removeMember } = useListMembers(listId);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<ListMemberRole>('member');
  const [isInviting, setIsInviting] = useState(false);

  const currentUserMember = members.find((m) => m.user_id === currentUserId);
  const isOwner = currentUserMember?.role === 'owner';
  const isAdmin = currentUserMember?.role === 'admin';
  const canManageMembers = isOwner || isAdmin;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    try {
      await addMember({
        list_id: listId,
        email: inviteEmail,
        role: inviteRole,
      });
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      // Error already toasted by hook
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: ListMemberRole) => {
    try {
      await updateMemberRole(memberId, newRole);
    } catch (error) {
      // Error already toasted by hook
    }
  };

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this member from the list?')) return;

    try {
      await removeMember(memberId);
    } catch (error) {
      // Error already toasted by hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            List Members
          </DialogTitle>
          <DialogDescription>
            Manage who has access to "{listTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invite Section */}
          {canManageMembers && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4" />
                Invite Member
              </div>

              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isInviting}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleInvite();
                      }
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="role" className="text-xs">
                    Role
                  </Label>
                  <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as ListMemberRole)}>
                    <SelectTrigger id="role" className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {isOwner && <SelectItem value="owner">Owner</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs opacity-0">Action</Label>
                  <Button
                    onClick={handleInvite}
                    disabled={isInviting || !inviteEmail.trim()}
                    className="w-full sm:w-auto"
                  >
                    {isInviting ? 'Inviting...' : 'Invite'}
                  </Button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <strong>Member:</strong> Can create and complete tasks
                <br />
                <strong>Admin:</strong> Can approve tasks and manage members
                <br />
                <strong>Owner:</strong> Full control including deletion
              </div>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            <div className="text-sm font-medium">
              Members ({members.length})
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((member) => {
                  const RoleIcon = roleIcons[member.role];
                  const isCurrentUser = member.user_id === currentUserId;
                  const canChangeRole = isOwner || (isAdmin && member.role !== 'owner');
                  const canRemove = isOwner && !isCurrentUser;

                  return (
                    <div
                      key={member.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg border p-3',
                        isCurrentUser && 'bg-accent/50'
                      )}
                    >
                      <Avatar>
                        <AvatarImage src={member.user?.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.user?.display_name?.[0] || member.user?.email?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {member.user?.display_name || member.user?.email || 'Unknown User'}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user?.email}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {canChangeRole ? (
                          <Select
                            value={member.role}
                            onValueChange={(v) => handleRoleChange(member.id, v as ListMemberRole)}
                          >
                            <SelectTrigger className="w-[110px] h-8 text-xs">
                              <div className="flex items-center gap-1.5">
                                <RoleIcon className={cn('h-3.5 w-3.5', roleColors[member.role])} />
                                <SelectValue />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">
                                <div className="flex items-center gap-1.5">
                                  <User className="h-3.5 w-3.5" />
                                  Member
                                </div>
                              </SelectItem>
                              <SelectItem value="admin">
                                <div className="flex items-center gap-1.5">
                                  <Shield className="h-3.5 w-3.5" />
                                  Admin
                                </div>
                              </SelectItem>
                              {isOwner && (
                                <SelectItem value="owner">
                                  <div className="flex items-center gap-1.5">
                                    <Crown className="h-3.5 w-3.5" />
                                    Owner
                                  </div>
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="secondary" className="gap-1.5">
                            <RoleIcon className={cn('h-3.5 w-3.5', roleColors[member.role])} />
                            {roleLabels[member.role]}
                          </Badge>
                        )}

                        {canRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemove(member.id)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
