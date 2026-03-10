'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, useTheme } from '@/lib/providers';
import { appConfig } from '@/lib/app.config';
import {
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  Settings,
  User,
  ChevronDown,
  CheckSquare,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { NotificationCenter } from './notification-center';
import { CommandPalette } from '@/components/search/command-palette';
import { Button } from '@/components/ui/button';

export function AppHeader() {
  const { user, loading, signOut } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cmd+K / Ctrl+K to open command palette
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setPaletteOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    window.location.href = '/';
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <Image
              src={appConfig.branding.icon}
              alt={appConfig.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <span className="text-sm font-semibold tracking-tight">{appConfig.name}</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Search trigger */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="hidden gap-2 text-muted-foreground sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search</span>
              <kbd className="pointer-events-none ml-1 hidden rounded border bg-muted px-1 font-mono text-xs sm:inline-flex">
                ⌘K
              </kbd>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPaletteOpen(true)}
              className="sm:hidden"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Button>

            {user && <NotificationCenter />}

            <button
              onClick={toggleTheme}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {loading ? (
              <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <span className="hidden max-w-[120px] truncate font-medium sm:inline">
                    {user.displayName || user.email}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 rounded-lg border border-border bg-card shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="border-b border-border/60 px-4 py-3">
                      <p className="truncate text-sm font-medium">{user.displayName || 'User'}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        Dashboard
                      </Link>
                      <Link
                        href="/todos"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        Todos
                      </Link>
                      <Link
                        href="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Account
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Settings
                      </Link>
                      <div className="my-1 border-t border-border/60" />
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
