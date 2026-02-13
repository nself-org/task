'use client';

import { CheckCircle2, Circle, Trash2, X, FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkComplete: () => void;
  onBulkUncomplete: () => void;
  onBulkDelete: () => void;
  onBulkMove?: () => void;
  className?: string;
}

export function BulkActionsToolbar({
  selectedCount,
  onClearSelection,
  onBulkComplete,
  onBulkUncomplete,
  onBulkDelete,
  onBulkMove,
  className,
}: BulkActionsToolbarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
        'bg-background border rounded-lg shadow-lg',
        'px-4 py-3 flex items-center gap-3',
        'animate-in slide-in-from-bottom-5 duration-200',
        className
      )}
    >
      {/* Selection info */}
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="text-muted-foreground">{selectedCount} selected</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear selection</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBulkComplete}
          className="h-8 gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Complete
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onBulkUncomplete}
          className="h-8 gap-2"
        >
          <Circle className="h-4 w-4" />
          Uncomplete
        </Button>

        {onBulkMove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBulkMove}
            className="h-8 gap-2"
          >
            <FolderInput className="h-4 w-4" />
            Move
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onBulkDelete}
          className="h-8 gap-2 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
