import { Capacitor } from '@capacitor/core';

declare global {
  interface Window {
    __TAURI__?: unknown;
  }
}

export const isDesktop = () =>
  typeof window !== 'undefined' &&
  window.__TAURI__ !== undefined;

export const isMacOS = () =>
  isDesktop() && navigator.platform.startsWith('Mac');

export const isWindows = () =>
  isDesktop() && navigator.platform.startsWith('Win');

export const isLinux = () =>
  isDesktop() && navigator.platform.startsWith('Linux');

// Listen for new task shortcut emitted from tray menu
export function onNewTaskShortcut(callback: () => void): () => void {
  if (!isDesktop()) return () => {};

  // Dynamic import to avoid SSR issues
  let unlisten: (() => void) | null = null;

  import('@tauri-apps/api/event').then(({ listen }) => {
    listen('new-task-shortcut', callback).then((fn) => {
      unlisten = fn;
    });
  });

  return () => {
    unlisten?.();
  };
}

// Open external URL in default browser (desktop only)
export async function openExternal(url: string): Promise<void> {
  if (isDesktop()) {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(url);
  } else {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
