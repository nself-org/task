/**
 * Recurring Task Reset Worker (Client-side fallback)
 *
 * Resets recurring todos at 3:00 AM daily.
 * For daily recurring tasks, creates a new instance for the current day.
 *
 * The primary implementation is server-side via pg_cron (see migration 008).
 * This client-side worker serves as a fallback for when the app is open but
 * the server-side cron has not yet run (e.g., self-hosted instances without
 * pg_cron, or users in timezones ahead of UTC).
 */

import { todoService } from '@/lib/services/todos';
import { listService } from '@/lib/services/lists';
import { getBackend } from '@/lib/backend';
import { Tables } from '@/lib/utils/tables';

let intervalId: NodeJS.Timeout | null = null;
let lastResetDate: string | null = null;

const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/**
 * Determine if a recurring task should reset today based on its recurrence rule.
 * Supported formats:
 *   - "daily" — every day
 *   - "weekly:mon,wed,fri" — specific days of the week
 *   - "monthly:15" — specific day of month (boundary-safe: 31 on Feb → last day)
 */
function shouldResetToday(pattern: string, rule: string, now: Date): boolean {
  if (pattern === 'daily') return true;

  if (pattern === 'weekly') {
    const parts = rule.split(':');
    if (parts.length < 2) return false;
    const days = parts[1].toLowerCase().split(',').map(d => d.trim());
    const todayName = DAY_NAMES[now.getDay()];
    return days.includes(todayName);
  }

  if (pattern === 'monthly') {
    const parts = rule.split(':');
    if (parts.length < 2) return false;
    const targetDay = parseInt(parts[1], 10);
    if (isNaN(targetDay)) return false;
    const todayDay = now.getDate();
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    // If target is 31 but month only has 28 days, trigger on last day
    if (targetDay > lastDayOfMonth) return todayDay === lastDayOfMonth;
    return todayDay === targetDay;
  }

  return false;
}

/**
 * Reset all recurring todos (daily, weekly, monthly)
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

        const shouldReset = shouldResetToday(pattern, todo.recurrence_rule, now);

        if (shouldReset) {
          const instance = await todoService.getRecurringInstance(todo.id, today);

          if (!instance) {
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
