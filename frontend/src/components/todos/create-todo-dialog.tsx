'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Calendar, Flag, Tag, FileText, MapPin, Repeat, Clock, Paperclip, X } from 'lucide-react';
import type { CreateTodoInput, TodoPriority } from '@/lib/types/todos';
import { format } from 'date-fns';

interface CreateTodoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: string;
  onCreate: (input: CreateTodoInput) => Promise<void>;
}

const PRIORITY_OPTIONS: { value: TodoPriority; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: 'bg-gray-100 text-gray-700' },
  { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-700' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
];

const RECURRENCE_OPTIONS = [
  { value: '', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function CreateTodoDialog({ open, onOpenChange, listId, onCreate }: CreateTodoDialogProps) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('none');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState('');
  const [locationName, setLocationName] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [reminderMinutes, setReminderMinutes] = useState('60');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const parseNaturalLanguageDate = (input: string): Date | null => {
    const now = new Date();
    const lower = input.toLowerCase().trim();

    // Today
    if (lower === 'today') {
      return now;
    }

    // Tomorrow
    if (lower === 'tomorrow') {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }

    // Next week
    if (lower === 'next week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }

    // Days of week (next monday, tuesday, etc.)
    const dayMatch = lower.match(/(?:next\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (dayMatch) {
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDay = days.indexOf(dayMatch[1]);
      const currentDay = now.getDay();
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // Next occurrence
      const result = new Date(now);
      result.setDate(result.getDate() + daysToAdd);
      return result;
    }

    // In X days
    const daysMatch = lower.match(/in\s+(\d+)\s+days?/);
    if (daysMatch) {
      const result = new Date(now);
      result.setDate(result.getDate() + parseInt(daysMatch[1], 10));
      return result;
    }

    return null;
  };

  const handleDueDateChange = (value: string) => {
    setDueDate(value);

    // Try to parse natural language
    const parsed = parseNaturalLanguageDate(value);
    if (parsed) {
      setDueDate(format(parsed, 'yyyy-MM-dd'));
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsCreating(true);
    try {
      const input: CreateTodoInput = {
        list_id: listId,
        title: title.trim(),
        priority,
        tags,
        notes: notes.trim() || null,
        recurrence_rule: recurrence || null,
      };

      // Combine date and time for due_date
      if (dueDate) {
        const dueDateObj = new Date(dueDate);
        if (dueTime) {
          const [hours, minutes] = dueTime.split(':');
          dueDateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        }
        input.due_date = dueDateObj.toISOString();

        // Set reminder time if due date is set
        if (reminderMinutes) {
          const reminderDate = new Date(dueDateObj);
          reminderDate.setMinutes(reminderDate.getMinutes() - parseInt(reminderMinutes, 10));
          input.reminder_time = reminderDate.toISOString();
        }
      }

      // Location (simplified - full geocoding would use map picker)
      if (locationName.trim()) {
        input.location_name = locationName.trim();
        // Default radius 100m - full implementation would use map picker
        input.location_radius = 100;
      }

      await onCreate(input);

      // Reset form
      setTitle('');
      setDueDate('');
      setDueTime('');
      setPriority('none');
      setTags([]);
      setNotes('');
      setLocationName('');
      setRecurrence('');
      setReminderMinutes('60');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create todo:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Todo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* Due Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due-date">
                <Calendar className="inline h-4 w-4 mr-1" />
                Due Date
              </Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                placeholder="tomorrow, next monday, etc."
              />
              <p className="text-xs text-muted-foreground">
                Or type: "tomorrow", "next monday", "in 3 days"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-time">
                <Clock className="inline h-4 w-4 mr-1" />
                Time
              </Label>
              <Input
                id="due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={!dueDate}
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>
              <Flag className="inline h-4 w-4 mr-1" />
              Priority
            </Label>
            <div className="flex gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={priority === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(option.value)}
                  className={priority === option.value ? option.color : ''}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <Accordion type="multiple" className="w-full">
            {/* Tags */}
            <AccordionItem value="tags">
              <AccordionTrigger>
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag (press Enter)"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <Button type="button" onClick={handleAddTag} size="sm">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        #{tag}
                        <X className="ml-1 h-3 w-3" />
                      </Badge>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Notes */}
            <AccordionItem value="notes">
              <AccordionTrigger>
                <FileText className="h-4 w-4 mr-2" />
                Notes
              </AccordionTrigger>
              <AccordionContent>
                <Textarea
                  placeholder="Add any additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Location */}
            <AccordionItem value="location">
              <AccordionTrigger>
                <MapPin className="h-4 w-4 mr-2" />
                Location Reminder
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <Input
                  placeholder="e.g., Walmart, Home, Office"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Get reminded when you arrive at this location (within 100m)
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Recurring */}
            <AccordionItem value="recurring">
              <AccordionTrigger>
                <Repeat className="h-4 w-4 mr-2" />
                Repeat
              </AccordionTrigger>
              <AccordionContent className="space-y-2">
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger>
                    <SelectValue placeholder="Does not repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Daily tasks reset at 3:00 AM
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Reminder */}
            {dueDate && (
              <AccordionItem value="reminder">
                <AccordionTrigger>
                  <Clock className="h-4 w-4 mr-2" />
                  Reminder
                </AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">At time of due date</SelectItem>
                      <SelectItem value="15">15 minutes before</SelectItem>
                      <SelectItem value="30">30 minutes before</SelectItem>
                      <SelectItem value="60">1 hour before</SelectItem>
                      <SelectItem value="120">2 hours before</SelectItem>
                      <SelectItem value="1440">1 day before</SelectItem>
                    </SelectContent>
                  </Select>
                </AccordionContent>
              </AccordionItem>
            )}
          </Accordion>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isCreating}>
            {isCreating ? 'Creating...' : 'Create Todo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
