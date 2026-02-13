'use client';

import { useState, useEffect } from 'react';
import { useList } from '@/hooks/use-lists';
import { ListHeader } from '@/components/lists/list-header';
import { ListSidebar } from '@/components/lists/list-sidebar';
import { TodoList } from '@/components/todos/todo-list';
import { TodoToolbar } from '@/components/todos/todo-toolbar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { TodoFilters, TodoSortOptions } from '@/lib/types/todos';

interface ListPageContentProps {
  listId: string;
}

export function ListPageContent({ listId }: ListPageContentProps) {
  const { list, loading, error } = useList(listId);

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TodoFilters>({ listId });
  const [sort, setSort] = useState<TodoSortOptions>({
    field: 'position',
    ascending: true
  });

  // Update filters when listId changes
  useEffect(() => {
    setFilters({ listId });
  }, [listId]);

  if (loading) {
    return (
      <div className="flex h-screen">
        <div className="w-64 border-r bg-background p-4">
          <Skeleton className="mb-4 h-8 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
          <Skeleton className="mb-2 h-12 w-full" />
        </div>
        <div className="flex-1">
          <Skeleton className="h-16 w-full border-b" />
          <div className="p-6">
            <Skeleton className="mb-4 h-8 w-64" />
            <Skeleton className="mb-2 h-12 w-full" />
            <Skeleton className="mb-2 h-12 w-full" />
            <Skeleton className="mb-2 h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>List not found</AlertTitle>
          <AlertDescription>
            The list you're looking for doesn't exist or you don't have access to it.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <ListSidebar activeListId={listId} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <ListHeader list={list} />

        {/* Toolbar with search, filters, sort */}
        <TodoToolbar
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
        />

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto p-6">
          <TodoList
            listId={listId}
            search={search}
            filters={filters}
            sort={sort}
          />
        </div>
      </div>
    </div>
  );
}
