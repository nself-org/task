'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { useGroups } from '@/hooks/use-groups';
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
import type { ListGroup } from '@/lib/types/lists';

const GROUP_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6',
];

interface ManageGroupsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageGroupsDialog({ open, onOpenChange }: ManageGroupsDialogProps) {
  const { groups, loading, createGroup, updateGroup, deleteGroup } = useGroups();
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState(GROUP_COLORS[0]);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    await createGroup({ title: newTitle.trim(), color: newColor });
    setNewTitle('');
    setNewColor(GROUP_COLORS[0]);
    setCreating(false);
  };

  const startEdit = (group: ListGroup) => {
    setEditingId(group.id);
    setEditTitle(group.title);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateGroup(id, { title: editTitle.trim() });
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    await deleteGroup(id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Manage groups</DialogTitle>
          <DialogDescription>
            Organize your lists into groups for easier navigation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new group */}
          <form onSubmit={handleCreate} className="space-y-2">
            <Label>New group</Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Group name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={!newTitle.trim() || creating}>
                <Plus className="mr-1 h-4 w-4" />
                Add
              </Button>
            </div>
            {/* Color picker */}
            <div className="flex gap-1.5">
              {GROUP_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewColor(color)}
                  className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: newColor === color ? 'white' : 'transparent',
                    outline: newColor === color ? `2px solid ${color}` : 'none',
                  }}
                />
              ))}
            </div>
          </form>

          {/* Existing groups */}
          {!loading && groups.length > 0 && (
            <div className="space-y-1">
              <Label>Existing groups ({groups.length})</Label>
              <div className="max-h-[240px] space-y-1 overflow-y-auto">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center gap-2 rounded-md border px-3 py-2"
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />

                    {editingId === group.id ? (
                      <>
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="h-7 flex-1 text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(group.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-7 w-7 p-0"
                          onClick={() => saveEdit(group.id)}
                        >
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-7 w-7 p-0"
                          onClick={cancelEdit}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm">{group.title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-7 w-7 p-0"
                          onClick={() => startEdit(group)}
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="h-7 w-7 p-0"
                          onClick={() => handleDelete(group.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && groups.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No groups yet. Create one above.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
