/**
 * Due Reminder Worker
 *
 * Monitors todos with due dates and sends notifications before they're due.
 * Configurable reminder time (default: 60 minutes before).
 */

import { todoService } from '@/lib/services/todos';
import { listService } from '@/lib/services/lists';
import { notificationService } from '@/lib/services/notifications';
import { preferencesService } from '@/lib/services/preferences';

let intervalId: NodeJS.Timeout | null = null;
let notifiedTodos: Set<string> = new Set();

/**
 * Check all todos and send reminders for upcoming due dates
 */
async function checkDueTodos() {
  try {
    const preferences = await preferencesService.getPreferences();
    if (!preferences) return;

    const { due_reminders, due_reminder_minutes_before } = preferences.notification_settings;

    // Skip if due reminders are disabled
    if (!due_reminders) return;

    // Get all user's lists
    const lists = await listService.getLists();

    // Check todos in each list
    for (const list of lists) {
      const todos = await todoService.getTodos(list.id);

      for (const todo of todos) {
        // Skip if no due date, already completed, or already notified
        if (!todo.due_date || todo.completed || notifiedTodos.has(todo.id)) {
          continue;
        }

        const dueDate = new Date(todo.due_date);
        const now = new Date();
        const minutesUntilDue = (dueDate.getTime() - now.getTime()) / 60000;

        // Check if it's time to send reminder
        if (minutesUntilDue > 0 && minutesUntilDue <= due_reminder_minutes_before) {
          // Send notification
          await notificationService.notifyDueReminder(todo.title, list.id, Math.floor(minutesUntilDue));

          // Mark as notified
          notifiedTodos.add(todo.id);

          console.log('[DueReminder] Sent reminder for:', todo.title);
        }

        // Remove from notified set if the todo is past due (allow re-notification if rescheduled)
        if (minutesUntilDue < 0) {
          notifiedTodos.delete(todo.id);
        }
      }
    }
  } catch (error) {
    console.error('[DueReminder] Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Start the due reminder worker
 * Checks every 5 minutes for upcoming due dates
 */
export function startDueReminderWorker() {
  if (intervalId) {
    console.warn('[DueReminder] Worker already running');
    return;
  }

  // Check immediately
  checkDueTodos();

  // Then check every 5 minutes
  intervalId = setInterval(checkDueTodos, 300000); // 5 minutes

  console.log('[DueReminder] Worker started');
}

/**
 * Stop the due reminder worker
 */
export function stopDueReminderWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    notifiedTodos.clear();
    console.log('[DueReminder] Worker stopped');
  }
}

/**
 * Get worker status
 */
export function isDueReminderRunning() {
  return intervalId !== null;
}

// Auto-start if in browser context
if (typeof window !== 'undefined') {
  // Start after app initialization
  setTimeout(() => {
    startDueReminderWorker();
  }, 8000);
}
