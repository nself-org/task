'use client';

import { useState } from 'react';
import { Search, Filter, ArrowUpDown, Calendar, List as ListIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import type { TodoFilters, TodoSortOptions, TodoPriority } from '@/lib/types/todos';

interface TodoToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  filters: TodoFilters;
  onFiltersChange: (filters: TodoFilters) => void;
  sort: TodoSortOptions;
  onSortChange: (sort: TodoSortOptions) => void;
  view?: 'list' | 'calendar';
  onViewChange?: (view: 'list' | 'calendar') => void;
}

export function TodoToolbar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  view = 'list',
  onViewChange,
}: TodoToolbarProps) {
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  const activeFilterCount =
    (filters.priority ? 1 : 0) +
    (filters.completed !== undefined ? 1 : 0) +
    (filters.tags && filters.tags.length > 0 ? 1 : 0) +
    (filters.dueAfter || filters.dueBefore ? 1 : 0);

  const handlePriorityToggle = (priority: TodoPriority) => {
    onFiltersChange({
      ...filters,
      priority: filters.priority === priority ? undefined : priority,
    });
  };

  const handleCompletedToggle = (completed?: boolean) => {
    onFiltersChange({
      ...filters,
      completed: filters.completed === completed ? undefined : completed,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      listId: filters.listId,
    });
  };

  const getSortLabel = () => {
    switch (sort.field) {
      case 'position':
        return 'Position';
      case 'created_at':
        return 'Created';
      case 'due_date':
        return 'Due Date';
      case 'priority':
        return 'Priority';
      case 'title':
        return 'Title';
      default:
        return 'Sort';
    }
  };

  return (
    <div className="border-b bg-background px-6 py-3">
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search todos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 pr-8"
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-1/2 h-full -translate-y-1/2 px-2"
              onClick={() => onSearchChange('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters */}
        <DropdownMenu open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 min-w-5 px-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="flex items-center justify-between">
              Filters
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </Button>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Status
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.completed === false}
              onCheckedChange={() => handleCompletedToggle(false)}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.completed === true}
              onCheckedChange={() => handleCompletedToggle(true)}
            >
              Completed
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              Priority
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={filters.priority === 'high'}
              onCheckedChange={() => handlePriorityToggle('high')}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                High
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priority === 'medium'}
              onCheckedChange={() => handlePriorityToggle('medium')}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-orange-500" />
                Medium
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.priority === 'low'}
              onCheckedChange={() => handlePriorityToggle('low')}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Low
              </span>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {getSortLabel()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onSortChange({ field: 'position', ascending: true })}
            >
              Position
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange({ field: 'created_at', ascending: false })}
            >
              Created (Newest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange({ field: 'created_at', ascending: true })}
            >
              Created (Oldest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange({ field: 'due_date', ascending: true })}
            >
              Due Date (Soonest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange({ field: 'due_date', ascending: false })}
            >
              Due Date (Latest)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange({ field: 'priority', ascending: false })}
            >
              Priority (High to Low)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onSortChange({ field: 'title', ascending: true })}
            >
              Title (A-Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* View toggle (if provided) */}
        {onViewChange && (
          <div className="ml-auto flex gap-1 rounded-md border p-1">
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('list')}
              className="h-7 px-2"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewChange('calendar')}
              className="h-7 px-2"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {filters.completed !== undefined && (
            <Badge variant="secondary" className="gap-1">
              {filters.completed ? 'Completed' : 'Active'}
              <button
                onClick={() => handleCompletedToggle(undefined)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="gap-1">
              {filters.priority.charAt(0).toUpperCase() + filters.priority.slice(1)} priority
              <button
                onClick={() => onFiltersChange({ ...filters, priority: undefined })}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
