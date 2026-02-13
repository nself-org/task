'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

/**
 * Global keyboard shortcuts component
 * Add this to the root layout to enable app-wide shortcuts
 */
export function KeyboardShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const [showHelp, setShowHelp] = useState(false);

  // Show/hide help modal (?)
  useKeyboardShortcut('?', () => setShowHelp(true), {
    enabled: !showHelp,
    preventDefault: true,
  });

  // Close help modal (Escape)
  useKeyboardShortcut('Escape', () => setShowHelp(false), {
    enabled: showHelp,
    preventDefault: true,
  });

  // Navigate to home (g + h)
  const [gPressed, setGPressed] = useState(false);
  useKeyboardShortcut('g', () => setGPressed(true), {
    preventDefault: false,
  });

  useEffect(() => {
    if (gPressed) {
      const timeout = setTimeout(() => setGPressed(false), 1000);
      return () => clearTimeout(timeout);
    }
  }, [gPressed]);

  useKeyboardShortcut('h', () => {
    if (gPressed) {
      router.push('/');
      setGPressed(false);
    }
  }, {
    enabled: gPressed,
  });

  // Navigate to lists (g + l)
  useKeyboardShortcut('l', () => {
    if (gPressed) {
      router.push('/lists');
      setGPressed(false);
    }
  }, {
    enabled: gPressed,
  });

  // Navigate to today (g + t)
  useKeyboardShortcut('t', () => {
    if (gPressed) {
      router.push('/today');
      setGPressed(false);
    }
  }, {
    enabled: gPressed,
  });

  // Navigate to overdue (g + o)
  useKeyboardShortcut('o', () => {
    if (gPressed) {
      router.push('/overdue');
      setGPressed(false);
    }
  }, {
    enabled: gPressed,
  });

  // Navigate to calendar (g + c)
  useKeyboardShortcut('c', () => {
    if (gPressed) {
      router.push('/calendar');
      setGPressed(false);
    }
  }, {
    enabled: gPressed,
  });

  // Navigate to settings (g + s)
  useKeyboardShortcut('s', () => {
    if (gPressed) {
      router.push('/settings');
      setGPressed(false);
    }
  }, {
    enabled: gPressed,
  });

  return (
    <>
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
            <DialogDescription>
              Navigate and interact with the app using your keyboard
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Navigation */}
            <div>
              <h3 className="mb-3 font-semibold">Navigation</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['g', 'h']} description="Go to Home" />
                <ShortcutRow keys={['g', 'l']} description="Go to Lists" />
                <ShortcutRow keys={['g', 't']} description="Go to Today" />
                <ShortcutRow keys={['g', 'o']} description="Go to Overdue" />
                <ShortcutRow keys={['g', 'c']} description="Go to Calendar" />
                <ShortcutRow keys={['g', 's']} description="Go to Settings" />
              </div>
            </div>

            {/* Quick Add */}
            <div>
              <h3 className="mb-3 font-semibold">Quick Add</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['Enter']} description="Add todo (when in quick-add field)" />
                <ShortcutRow keys={['Esc']} description="Clear quick-add field" />
              </div>
            </div>

            {/* Priority Shortcuts */}
            <div>
              <h3 className="mb-3 font-semibold">Priority Shortcuts (in quick-add)</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['!1']} description="High priority" />
                <ShortcutRow keys={['!2']} description="Medium priority" />
                <ShortcutRow keys={['!3']} description="Low priority" />
              </div>
            </div>

            {/* Help */}
            <div>
              <h3 className="mb-3 font-semibold">Help</h3>
              <div className="space-y-2">
                <ShortcutRow keys={['?']} description="Show this help menu" />
                <ShortcutRow keys={['Esc']} description="Close dialogs" />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Visual indicator when 'g' is pressed */}
      {gPressed && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg border bg-background p-3 shadow-lg">
          <p className="text-sm font-medium">
            Press <Badge variant="secondary" className="mx-1">h</Badge> for home,
            <Badge variant="secondary" className="mx-1">l</Badge> for lists,
            <Badge variant="secondary" className="mx-1">t</Badge> for today...
          </p>
        </div>
      )}
    </>
  );
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <span key={i}>
            <Badge variant="outline" className="font-mono">
              {key}
            </Badge>
            {i < keys.length - 1 && <span className="mx-1 text-muted-foreground">then</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
