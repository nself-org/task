'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TodoPriority } from '@/lib/types/todos';

interface QuickAddTodoProps {
  onAdd: (title: string, priority?: TodoPriority) => Promise<void>;
  placeholder?: string;
  className?: string;
}

/**
 * Quick-add inline todo form
 * Supports natural language priority (!1, !2, !3 for high, medium, low)
 */
export function QuickAddTodo({ onAdd, placeholder = 'Add a task...', className }: QuickAddTodoProps) {
  const [value, setValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const parsePriority = (text: string): { title: string; priority?: TodoPriority } => {
    // Check for priority markers: !1 (high), !2 (medium), !3 (low)
    const highMatch = text.match(/!1\s?/);
    const mediumMatch = text.match(/!2\s?/);
    const lowMatch = text.match(/!3\s?/);

    let priority: TodoPriority | undefined;
    let cleanedTitle = text;

    if (highMatch) {
      priority = 'high';
      cleanedTitle = text.replace(/!1\s?/, '').trim();
    } else if (mediumMatch) {
      priority = 'medium';
      cleanedTitle = text.replace(/!2\s?/, '').trim();
    } else if (lowMatch) {
      priority = 'low';
      cleanedTitle = text.replace(/!3\s?/, '').trim();
    }

    return { title: cleanedTitle, priority };
  };

  const handleAdd = async () => {
    if (!value.trim()) return;

    setIsAdding(true);
    try {
      const { title, priority } = parsePriority(value);
      await onAdd(title, priority);
      setValue('');
      inputRef.current?.focus();
    } catch {
      // Error handling delegated to the onAdd callback
    } finally {
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    } else if (e.key === 'Escape') {
      setValue('');
      inputRef.current?.blur();
    }
  };

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div
      className={cn(
        'relative flex items-center gap-2 rounded-lg border transition-all',
        isFocused ? 'border-primary ring-2 ring-primary/20' : 'border-border',
        className
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground">
        <Plus className="h-5 w-5" />
      </div>

      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={isAdding}
        className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />

      {value && (
        <div className="flex shrink-0 items-center gap-1 pr-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 w-7 p-0"
            tabIndex={-1}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear</span>
          </Button>

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleAdd}
            disabled={isAdding || !value.trim()}
            className="h-7 px-3"
          >
            {isAdding ? 'Adding...' : 'Add'}
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Helper text component explaining quick-add shortcuts
 */
export function QuickAddHelp() {
  return (
    <div className="text-xs text-muted-foreground">
      <span>Tip: Use </span>
      <code className="rounded bg-muted px-1 py-0.5">!1</code>
      <span> for high priority, </span>
      <code className="rounded bg-muted px-1 py-0.5">!2</code>
      <span> for medium, </span>
      <code className="rounded bg-muted px-1 py-0.5">!3</code>
      <span> for low. Press </span>
      <code className="rounded bg-muted px-1 py-0.5">Enter</code>
      <span> to add, </span>
      <code className="rounded bg-muted px-1 py-0.5">Esc</code>
      <span> to cancel.</span>
    </div>
  );
}
