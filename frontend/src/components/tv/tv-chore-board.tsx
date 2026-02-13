'use client';

import { useState, useEffect, useRef } from 'react';
import { useTodos } from '@/hooks/use-todos';
import { useCanApprove } from '@/hooks/use-list-members';
import { useAuth } from '@/lib/providers/auth-provider';
import type { Todo } from '@/lib/types/todos';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, Camera, Flag, User } from 'lucide-react';
import { format } from 'date-fns';

interface TVChoreBoardProps {
  listId: string;
  listTitle: string;
}

/**
 * TV-optimized chore board with:
 * - Extra-large fonts (32-64px)
 * - D-pad navigation
 * - Large touch targets
 * - High contrast
 * - Real-time updates
 */
export function TVChoreBoard({ listId, listTitle }: TVChoreBoardProps) {
  const { user } = useAuth();
  const { todos, loading, toggleTodo } = useTodos(listId);
  const { canApprove } = useCanApprove(listId, user?.id);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const todoRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Filter: Show incomplete first, then completed
  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  // D-pad navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(sortedTodos.length - 1, prev + 1));
          break;
        case 'Enter':
        case 'OK': // Some TV remotes use "OK"
          e.preventDefault();
          handleSelectTodo(sortedTodos[focusedIndex]);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, sortedTodos]);

  // Auto-scroll focused item into view
  useEffect(() => {
    todoRefs.current[focusedIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [focusedIndex]);

  const handleSelectTodo = async (todo: Todo) => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      await toggleTodo(todo.id);
    } finally {
      setIsCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="mb-6 h-24 w-24 mx-auto animate-spin rounded-full border-8 border-yellow-400 border-t-transparent" />
          <p className="text-4xl font-bold">Loading chores...</p>
        </div>
      </div>
    );
  }

  const awaitingApproval = sortedTodos.filter(
    (t) => t.completed && t.requires_approval && !t.approved
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-12 text-white">
      {/* Header */}
      <div className="mb-10 flex items-center justify-between border-b-4 border-yellow-400 pb-6">
        <div>
          <h1 className="mb-2 text-6xl font-bold tracking-tight">{listTitle}</h1>
          <p className="text-3xl text-slate-300">
            {sortedTodos.filter((t) => !t.completed).length} tasks remaining
          </p>
        </div>

        {awaitingApproval.length > 0 && canApprove && (
          <div className="rounded-2xl bg-orange-500 px-8 py-4 text-center">
            <div className="text-2xl font-semibold">Awaiting Approval</div>
            <div className="text-5xl font-bold">{awaitingApproval.length}</div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-6">
        {sortedTodos.length === 0 ? (
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-6 h-32 w-32 text-green-400" />
              <p className="text-5xl font-bold">All Done!</p>
              <p className="mt-4 text-3xl text-slate-300">No tasks to show</p>
            </div>
          </div>
        ) : (
          sortedTodos.map((todo, index) => {
            const isFocused = index === focusedIndex;
            const needsApproval = todo.completed && todo.requires_approval && !todo.approved;

            return (
              <div
                key={todo.id}
                ref={(el) => {
                  todoRefs.current[index] = el;
                }}
                className={cn(
                  'flex items-start gap-8 rounded-3xl p-8 transition-all duration-200',
                  isFocused
                    ? 'scale-105 bg-yellow-400 text-slate-900 shadow-2xl ring-8 ring-yellow-400'
                    : 'bg-slate-800/80 hover:bg-slate-800',
                  todo.completed && 'opacity-60'
                )}
              >
                {/* Checkbox */}
                <div className="shrink-0">
                  {todo.completed ? (
                    <CheckCircle2 className="h-20 w-20 text-green-400" />
                  ) : (
                    <Circle className="h-20 w-20 text-slate-400" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="mb-3 flex items-start gap-4">
                    <p
                      className={cn(
                        'text-4xl font-semibold leading-tight',
                        todo.completed && 'line-through'
                      )}
                    >
                      {todo.title}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-2xl">
                    {/* Priority */}
                    {todo.priority !== 'none' && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-700/50 px-4 py-2">
                        <Flag className="h-6 w-6" />
                        <span className="capitalize">{todo.priority}</span>
                      </div>
                    )}

                    {/* Photo required */}
                    {todo.requires_photo && !todo.completion_photo_url && (
                      <div className="flex items-center gap-2 rounded-xl bg-blue-500/80 px-4 py-2">
                        <Camera className="h-6 w-6" />
                        Photo Required
                      </div>
                    )}

                    {/* Approval status */}
                    {todo.approved && (
                      <div className="flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-white">
                        <CheckCircle2 className="h-6 w-6" />
                        Approved
                      </div>
                    )}

                    {needsApproval && (
                      <div className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-white">
                        <Clock className="h-6 w-6" />
                        Awaiting Approval
                      </div>
                    )}

                    {/* Completed by */}
                    {todo.completed && todo.completed_by_user && (
                      <div className="flex items-center gap-2 rounded-xl bg-slate-700/50 px-4 py-2">
                        <User className="h-6 w-6" />
                        {todo.completed_by_user.display_name || todo.completed_by_user.email}
                      </div>
                    )}

                    {/* Due date */}
                    {todo.due_date && !todo.completed && (
                      <div className="text-slate-300">
                        Due: {format(new Date(todo.due_date), 'MMM d, h:mm a')}
                      </div>
                    )}
                  </div>

                  {/* Notes preview */}
                  {todo.notes && (
                    <p className="mt-3 text-2xl text-slate-300 line-clamp-2">
                      {todo.notes}
                    </p>
                  )}
                </div>

                {/* Focus indicator */}
                {isFocused && (
                  <div className="shrink-0 flex flex-col items-center justify-center text-slate-900">
                    <div className="text-3xl font-bold">▶</div>
                    <div className="mt-2 text-xl">Press OK</div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation hints */}
      <div className="fixed bottom-8 right-8 rounded-2xl bg-slate-800/90 px-8 py-6 text-center shadow-2xl">
        <div className="text-2xl text-slate-300">
          <div className="mb-2">↑↓ Navigate</div>
          <div>OK to Complete</div>
        </div>
      </div>
    </div>
  );
}
