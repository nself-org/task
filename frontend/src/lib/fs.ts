import { isDesktop } from './desktop';

export interface ExportOptions {
  format: 'json' | 'csv' | 'markdown';
  filename?: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

/**
 * Export tasks to a file. On desktop uses Tauri dialog + fs.
 * On web uses browser download.
 */
export async function exportTasks(
  tasks: unknown[],
  options: ExportOptions = { format: 'json' }
): Promise<boolean> {
  const filename = options.filename ?? `ntasks-export-${new Date().toISOString().slice(0, 10)}`;
  const content = formatExport(tasks, options.format);
  const ext = options.format === 'markdown' ? 'md' : options.format;

  if (isDesktop()) {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    const path = await save({
      defaultPath: `${filename}.${ext}`,
      filters: [{ name: options.format.toUpperCase(), extensions: [ext] }],
    });
    if (!path) return false;
    await writeTextFile(path, content);
    return true;
  } else {
    // Browser download fallback
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  }
}

/**
 * Import tasks from a file. On desktop uses Tauri dialog + fs.
 * On web uses file input.
 */
export async function importTasks(): Promise<string | null> {
  if (isDesktop()) {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    const selected = await open({
      multiple: false,
      filters: [{ name: 'Tasks', extensions: ['json', 'csv', 'md'] }],
    });
    if (!selected || Array.isArray(selected)) return null;
    return readTextFile(selected);
  } else {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,.csv,.md';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsText(file);
      };
      input.click();
    });
  }
}

function formatExport(tasks: unknown[], format: 'json' | 'csv' | 'markdown'): string {
  if (format === 'json') {
    return JSON.stringify(tasks, null, 2);
  }

  if (format === 'csv') {
    const headers = 'id,title,completed,dueDate,listName,createdAt\n';
    const rows = (tasks as Record<string, unknown>[]).map((t) =>
      [
        t.id ?? '',
        `"${String(t.title ?? '').replace(/"/g, '""')}"`,
        t.completed ?? false,
        t.dueDate ?? '',
        `"${String(t.listName ?? '').replace(/"/g, '""')}"`,
        t.createdAt ?? '',
      ].join(',')
    );
    return headers + rows.join('\n');
  }

  // Markdown
  const lines = ['# ɳTask Export', '', `Exported: ${new Date().toLocaleString()}`, ''];
  for (const t of tasks as Record<string, unknown>[]) {
    const check = t.completed ? 'x' : ' ';
    lines.push(`- [${check}] ${t.title ?? 'Untitled'}`);
    if (t.dueDate) lines.push(`  - Due: ${t.dueDate}`);
    if (t.listName) lines.push(`  - List: ${t.listName}`);
  }
  return lines.join('\n');
}
