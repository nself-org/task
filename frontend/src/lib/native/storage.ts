import { Preferences } from '@capacitor/preferences';

/**
 * Typed wrapper around @capacitor/preferences for offline-capable key-value storage.
 * Use for: auth tokens, cached task lists, user preferences, offline queue.
 */
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    await Preferences.set({ key, value: JSON.stringify(value) });
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },

  async clear(): Promise<void> {
    await Preferences.clear();
  },

  async keys(): Promise<string[]> {
    const { keys } = await Preferences.keys();
    return keys;
  },
};

/** Keys used by ɳTask */
export const StorageKey = {
  AUTH_TOKEN: 'auth_token',
  AUTH_REFRESH: 'auth_refresh',
  CACHED_TASKS: 'cached_tasks',
  CACHED_LISTS: 'cached_lists',
  OFFLINE_QUEUE: 'offline_queue',
  USER_PREFS: 'user_prefs',
  PUSH_TOKEN: 'push_token',
  LAST_SYNC: 'last_sync',
} as const;

export type StorageKeyType = (typeof StorageKey)[keyof typeof StorageKey];
