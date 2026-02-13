'use client';

import { useState, useEffect } from 'react';
import { useLists } from '@/hooks/use-lists';
import { TVChoreBoard } from '../components/tv-chore-board';
import { cn } from '@/lib/utils';

/**
 * TV List Selection Screen
 * Shows all available lists in large tiles
 * D-pad navigation between lists
 */
export function TVListView() {
  const { lists, loading } = useLists();
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Auto-select first list
  useEffect(() => {
    if (lists.length > 0 && !selectedListId) {
      setSelectedListId(lists[0].id);
    }
  }, [lists, selectedListId]);

  // D-pad navigation for list selection
  useEffect(() => {
    if (selectedListId) return; // Don't handle keys when viewing a list

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(0, prev - 1));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(lists.length - 1, prev + 1));
          break;
        case 'Enter':
        case 'OK':
          e.preventDefault();
          if (lists[focusedIndex]) {
            setSelectedListId(lists[focusedIndex].id);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedIndex, lists, selectedListId]);

  // Handle back button to return to list selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Back') {
        e.preventDefault();
        setSelectedListId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Show selected list
  if (selectedListId) {
    const selectedList = lists.find((l) => l.id === selectedListId);
    if (selectedList) {
      return <TVChoreBoard listId={selectedList.id} listTitle={selectedList.title} />;
    }
  }

  // Show list selection screen
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="mb-6 h-24 w-24 mx-auto animate-spin rounded-full border-8 border-yellow-400 border-t-transparent" />
          <p className="text-4xl font-bold">Loading lists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-16 text-white">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-7xl font-bold tracking-tight">Choose a List</h1>
        <p className="text-3xl text-slate-300">Use ← → to navigate, OK to select</p>
      </div>

      <div className="grid grid-cols-3 gap-8 mx-auto max-w-7xl">
        {lists.map((list, index) => {
          const isFocused = index === focusedIndex;

          return (
            <div
              key={list.id}
              className={cn(
                'relative flex flex-col items-center justify-center rounded-3xl p-12 transition-all duration-200',
                isFocused
                  ? 'scale-110 bg-yellow-400 text-slate-900 shadow-2xl ring-8 ring-yellow-400'
                  : 'bg-slate-800/80 hover:bg-slate-800'
              )}
              style={{
                backgroundColor: isFocused ? undefined : `${list.color}20`,
                borderColor: isFocused ? undefined : list.color,
                borderWidth: isFocused ? undefined : '4px',
              }}
            >
              {/* List Icon */}
              <div className="mb-6 text-8xl">{list.icon || '📋'}</div>

              {/* List Title */}
              <h2 className="mb-4 text-center text-4xl font-bold">{list.title}</h2>

              {/* List Description */}
              {list.description && (
                <p className="text-center text-2xl opacity-80">{list.description}</p>
              )}

              {/* Focus Indicator */}
              {isFocused && (
                <div className="absolute bottom-6 text-2xl font-bold animate-pulse">
                  Press OK to Open
                </div>
              )}
            </div>
          );
        })}
      </div>

      {lists.length === 0 && (
        <div className="text-center">
          <p className="text-4xl text-slate-400">No lists available</p>
          <p className="mt-4 text-2xl text-slate-500">
            Create a list on your phone or computer first
          </p>
        </div>
      )}
    </div>
  );
}
