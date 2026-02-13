'use client';

import { useState } from 'react';
import type { Todo, UpdateTodoInput, TodoPriority } from '@/lib/types/todos';
import type { TodoShare } from '@/lib/services/todos';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Trash2,
  Edit2,
  Check,
  X,
  Share2,
  Globe,
  Calendar,
  MapPin,
  Repeat,
  Paperclip,
  FileText,
  Flag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Camera,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ShareTodoDialog } from './share-todo-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format, isToday, isTomorrow, isPast, differenceInHours } from 'date-fns';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => Promise<void>;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onTogglePublic: (id: string) => Promise<void>;
  onShare: (todoId: string, email: string, permission: 'view' | 'edit') => Promise<void>;
  onRemoveShare: (shareId: string) => Promise<void>;
  getShares: (todoId: string) => Promise<TodoShare[]>;
  onApprove?: (id: string) => Promise<void>;
  onReject?: (id: string, reason?: string) => Promise<void>;
  canApprove?: boolean;
  timeFormat?: '12h' | '24h';
  selected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
}

const priorityConfig: Record<TodoPriority, { color: string; label: string; icon: string }> = {
  none: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', label: '', icon: '' },
  low: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', label: 'Low', icon: '⬇️' },
  medium: { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', label: 'Med', icon: '➡️' },
  high: { color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'High', icon: '⬆️' },
};

export function TodoItem({
  todo,
  onToggle,
  onUpdate,
  onDelete,
  onTogglePublic,
  onShare,
  onRemoveShare,
  getShares,
  onApprove,
  onReject,
  canApprove = false,
  timeFormat = '12h',
  selected = false,
  onSelectChange,
  selectionMode = false,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isLoading, setIsLoading] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [editNotesValue, setEditNotesValue] = useState(todo.notes || '');
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await onToggle(todo.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    setIsLoading(true);
    try {
      await onUpdate(todo.id, { title: editTitle });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(todo.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleSaveNotes = async () => {
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { notes: editNotesValue || null });
      setEditingNotes(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelNotes = () => {
    setEditNotesValue(todo.notes || '');
    setEditingNotes(false);
  };

  const handleAddTag = async (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase().replace(/^#/, '');
    if (!trimmedTag || todo.tags.includes(trimmedTag)) return;

    setIsLoading(true);
    try {
      await onUpdate(todo.id, { tags: [...todo.tags, trimmedTag] });
      setTagInput('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    setIsLoading(true);
    try {
      await onUpdate(todo.id, { tags: todo.tags.filter((t) => t !== tagToRemove) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Escape') {
      setEditingTags(false);
      setTagInput('');
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;

    setApproving(true);
    try {
      await onApprove(todo.id);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!onReject) return;

    setRejecting(true);
    try {
      await onReject(todo.id, rejectReason || undefined);
      setRejectDialogOpen(false);
      setRejectReason('');
    } finally {
      setRejecting(false);
    }
  };

  // Due date helpers
  const getDueDateColor = () => {
    if (!todo.due_date || todo.completed) return '';

    const dueDate = new Date(todo.due_date);
    if (isPast(dueDate)) return 'text-red-600 dark:text-red-400';

    const hoursUntilDue = differenceInHours(dueDate, new Date());
    if (hoursUntilDue < 24) return 'text-orange-600 dark:text-orange-400';

    return 'text-muted-foreground';
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);

    if (isToday(dueDate)) {
      const timeStr = format(dueDate, timeFormat === '24h' ? 'HH:mm' : 'h:mm a');
      return `Today at ${timeStr}`;
    }

    if (isTomorrow(dueDate)) {
      const timeStr = format(dueDate, timeFormat === '24h' ? 'HH:mm' : 'h:mm a');
      return `Tomorrow at ${timeStr}`;
    }

    return format(dueDate, timeFormat === '24h' ? 'MMM d, HH:mm' : 'MMM d, h:mm a');
  };

  return (
    <>
      <div className={cn(
        "flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors group",
        selected && "bg-accent/50 border-primary"
      )}>
        {/* Selection checkbox (for bulk operations) */}
        {selectionMode && onSelectChange && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelectChange(todo.id, checked === true)}
            disabled={isLoading || isEditing}
            className="mt-1"
          />
        )}

        {/* Completion checkbox */}
        <Checkbox
          checked={todo.completed}
          onCheckedChange={handleToggle}
          disabled={isLoading || isEditing}
          className="mt-1"
        />

        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
            autoFocus
          />
        ) : (
          <div className="flex-1 min-w-0 space-y-2">
            {/* Title row */}
            <div className="flex items-start gap-2 flex-wrap">
              <p
                className={cn(
                  'text-sm font-medium',
                  todo.completed && 'line-through text-muted-foreground'
                )}
              >
                {todo.title}
              </p>

              {/* Priority badge */}
              {todo.priority !== 'none' && (
                <Badge
                  variant="secondary"
                  className={cn('text-[10px] px-2 py-0 h-5 shrink-0', priorityConfig[todo.priority].color)}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  {priorityConfig[todo.priority].label}
                </Badge>
              )}

              {/* Public badge */}
              {todo.is_public && (
                <Badge variant="secondary" className="text-[10px] px-2 py-0 h-5 shrink-0">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Badge>
              )}

              {/* Approval Status Badges */}
              {todo.requires_approval && todo.completed && !todo.approved && !todo.rejected_by && (
                <Badge className="text-[10px] px-2 py-0 h-5 shrink-0 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting Approval
                </Badge>
              )}

              {todo.approved && (
                <Badge className="text-[10px] px-2 py-0 h-5 shrink-0 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Approved
                </Badge>
              )}

              {todo.rejected_by && (
                <Badge className="text-[10px] px-2 py-0 h-5 shrink-0 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                  <XCircle className="h-3 w-3 mr-1" />
                  Rejected
                </Badge>
              )}

              {todo.requires_photo && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 shrink-0">
                  <Camera className="h-3 w-3 mr-1" />
                  Photo Required
                </Badge>
              )}
            </div>

            {/* Metadata row */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {/* Due date */}
              {todo.due_date && (
                <div className={cn('flex items-center gap-1', getDueDateColor())}>
                  <Calendar className="h-3 w-3" />
                  <span>{formatDueDate(todo.due_date)}</span>
                </div>
              )}

              {/* Location */}
              {todo.location_name && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{todo.location_name}</span>
                </div>
              )}

              {/* Recurring */}
              {todo.recurrence_rule && (
                <div className="flex items-center gap-1">
                  <Repeat className="h-3 w-3" />
                  <span>Repeats {todo.recurrence_rule.split(':')[0]}</span>
                </div>
              )}

              {/* Attachments count */}
              {todo.attachments && todo.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{todo.attachments.length}</span>
                </div>
              )}

              {/* Notes indicator - clickable to expand */}
              {todo.notes && (
                <button
                  type="button"
                  onClick={() => setNotesExpanded(!notesExpanded)}
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <FileText className="h-3 w-3" />
                  <span>Note</span>
                  {notesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>
              )}
            </div>

            {/* Tags */}
            {todo.tags && todo.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {todo.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="group/tag text-[10px] px-2 py-0 h-5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  >
                    #{tag}
                    {editingTags && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        disabled={isLoading}
                        className="ml-1 opacity-0 group-hover/tag:opacity-100 transition-opacity"
                        aria-label={`Remove tag ${tag}`}
                        title={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {editingTags && (
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagInputKeyDown}
                    onBlur={() => {
                      if (tagInput.trim()) handleAddTag(tagInput);
                      setEditingTags(false);
                    }}
                    placeholder="Add tag..."
                    disabled={isLoading}
                    className="h-5 w-24 text-[10px] px-2"
                    autoFocus
                  />
                )}
                {!editingTags && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingTags(true)}
                    disabled={isLoading}
                    className="h-5 px-2 text-[10px]"
                  >
                    + Tag
                  </Button>
                )}
              </div>
            )}

            {/* Tag input when no tags exist */}
            {(!todo.tags || todo.tags.length === 0) && !editingTags && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditingTags(true)}
                disabled={isLoading}
                className="h-5 px-2 text-[10px] w-fit"
              >
                + Add Tag
              </Button>
            )}

            {/* Tag input when no tags exist and editing */}
            {(!todo.tags || todo.tags.length === 0) && editingTags && (
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                onBlur={() => {
                  if (tagInput.trim()) handleAddTag(tagInput);
                  setEditingTags(false);
                }}
                placeholder="Add tag..."
                disabled={isLoading}
                className="h-5 w-32 text-[10px] px-2"
                autoFocus
              />
            )}

            {/* Expanded notes section */}
            {notesExpanded && todo.notes && (
              <div className="mt-2 border-t pt-2">
                {editingNotes ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editNotesValue}
                      onChange={(e) => setEditNotesValue(e.target.value)}
                      disabled={isLoading}
                      className="text-sm min-h-[80px]"
                      placeholder="Add notes..."
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleSaveNotes}
                        disabled={isLoading}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelNotes}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{todo.notes}</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditNotesValue(todo.notes || '');
                        setEditingNotes(true);
                      }}
                      disabled={isLoading}
                      className="h-7 px-2 text-xs"
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit Note
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Add notes button when no notes exist */}
            {!todo.notes && !editingNotes && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditNotesValue('');
                  setEditingNotes(true);
                  setNotesExpanded(true);
                }}
                disabled={isLoading}
                className="h-5 px-2 text-[10px] w-fit"
              >
                + Add Note
              </Button>
            )}

            {/* Editing notes when no notes exist */}
            {!todo.notes && editingNotes && (
              <div className="mt-2 space-y-2">
                <Textarea
                  value={editNotesValue}
                  onChange={(e) => setEditNotesValue(e.target.value)}
                  disabled={isLoading}
                  className="text-sm min-h-[80px]"
                  placeholder="Add notes..."
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveNotes}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelNotes}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleSave}
                disabled={isLoading || !editTitle.trim()}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {/* Approve/Reject buttons (only for approvers when task needs approval) */}
              {canApprove && todo.requires_approval && todo.completed && !todo.approved && (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={handleApprove}
                    disabled={isLoading || approving}
                    title="Approve"
                    className="h-8 w-8 text-green-600 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={isLoading || rejecting}
                    title="Reject"
                    className="h-8 w-8 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}

              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShareOpen(true)}
                disabled={isLoading}
                title="Share"
                className="h-8 w-8"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setEditTitle(todo.title);
                  setIsEditing(true);
                }}
                disabled={isLoading}
                title="Edit"
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleDelete}
                disabled={isLoading}
                title="Delete"
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Task</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this task (optional)
            </DialogDescription>
          </DialogHeader>

          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="min-h-[100px]"
          />

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
              disabled={rejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting}
            >
              {rejecting ? 'Rejecting...' : 'Reject Task'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ShareTodoDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        todoId={todo.id}
        todoTitle={todo.title}
        isPublic={todo.is_public}
        onTogglePublic={() => onTogglePublic(todo.id)}
        onShare={(email, perm) => onShare(todo.id, email, perm)}
        onRemoveShare={onRemoveShare}
        getShares={getShares}
      />
    </>
  );
}
