/**
 * Recurring Task Reset Worker
 *
 * Resets recurring todos at 3:00 AM daily.
 * For daily recurring tasks, creates a new instance for the current day.
 *
 * Note: In production, this would typically run server-side as a cron job.
 * This client-side implementation is for demonstration and works if the app is open.
 */

import { todoService } from '@/lib/services/todos';
import { listService } from '@/lib/services/lists';
import { getBackend } from '@/lib/backend';
import { Tables } from '@/lib/utils/tables';

let intervalId: NodeJS.Timeout | null = null;
let lastResetDate: string | null = null;

/**
 * Reset all daily recurring todos
 */
async function resetRecurringTodos() {
  try {
    const now = new Date();
    const currentHours = now.getHours();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Only run at 3:00 AM (within a 10-minute window)
    if (currentHours !== 3 || lastResetDate === today) {
      return; // Not time yet, or already reset today
    }

    console.log('[RecurringReset] Starting reset at', now.toISOString());

    // Get all user's lists
    const lists = await listService.getLists();

    let resetCount = 0;

    // Process todos in each list
    for (const list of lists) {
      const todos = await todoService.getTodos(list.id);

      for (const todo of todos) {
        // Skip non-recurring todos
        if (!todo.recurrence_rule) continue;

        // Parse recurrence rule
        const [pattern] = todo.recurrence_rule.split(':');

        // Only handle daily recurring for now
        if (pattern === 'daily') {
          // Check if instance already exists for today
          const instance = await todoService.getRecurringInstance(todo.id, today);

          if (!instance) {
            // Create new instance for today (uncompleted)
            await getBackend().db.insert(Tables.RECURRING_INSTANCES, {
              parent_todo_id: todo.id,
              instance_date: today,
              completed: false,
              completed_at: null,
            });

            resetCount++;
            console.log('[RecurringReset] Reset:', todo.title);
          }
        }

        // TODO: Add weekly/monthly support
        // For weekly: check if today matches the specified days
        // For monthly: check if today matches the specified dates
      }
    }

    lastResetDate = today;
    console.log(`[RecurringReset] Completed - reset ${resetCount} tasks`);
  } catch (error) {
    console.error('[RecurringReset] Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Start the recurring reset worker
 * Checks every 10 minutes if it's 3:00 AM and time to reset
 */
export function startRecurringResetWorker() {
  if (intervalId) {
    console.warn('[RecurringReset] Worker already running');
    return;
  }

  // Check immediately
  resetRecurringTodos();

  // Then check every 10 minutes
  intervalId = setInterval(resetRecurringTodos, 600000); // 10 minutes

  console.log('[RecurringReset] Worker started');
}

/**
 * Stop the recurring reset worker
 */
export function stopRecurringResetWorker() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[RecurringReset] Worker stopped');
  }
}

/**
 * Get worker status
 */
export function isRecurringResetRunning() {
  return intervalId !== null;
}

/**
 * Manually trigger a reset (for testing)
 */
export async function triggerResetNow() {
  lastResetDate = null; // Reset the gate
  await resetRecurringTodos();
}

// Auto-start if in browser context
if (typeof window !== 'undefined') {
  // Start after app initialization
  setTimeout(() => {
    startRecurringResetWorker();
  }, 12000);
}
