'use client';

import { useState, useEffect } from 'react';
import { useAuth, useOffline, useTheme } from '@/lib/providers';
import { config, getProviderLabel, getEnvironmentLabel } from '@/lib/config';
import { detectPlatform } from '@/lib/platform';
import { useHealthCheck } from '@/hooks/use-health-check';
import { env, getEnvironmentName } from '@/lib/env';
import { getFauxAccounts } from '@/lib/faux-signin';
import {
  Activity,
  Database,
  Shield,
  HardDrive,
  Radio,
  Zap,
  Wifi,
  WifiOff,
  Calendar,
  Settings,
  Bell,
  BarChart3,
  Code2,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { isOnline } = useOffline();
  const { resolvedTheme } = useTheme();
  const { status: health } = useHealthCheck();
  const platform = detectPlatform();
  const [showDevTools, setShowDevTools] = useState(false);

  useEffect(() => {
    setShowDevTools(env.enableDevTools);
  }, []);

  const greeting = getGreeting();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {greeting}, {user?.displayName || user?.email?.split('@')[0] || 'there'}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Welcome to your dashboard. Everything is looking good.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Status"
          value={isOnline ? 'Online' : 'Offline'}
          icon={isOnline ? Wifi : WifiOff}
          accent={isOnline ? 'text-emerald-500' : 'text-amber-500'}
        />
        <StatCard
          label="Backend"
          value={getProviderLabel()}
          icon={Database}
          accent="text-sky-500"
        />
        <StatCard
          label="Latency"
          value={health ? `${health.latencyMs}ms` : '--'}
          icon={Activity}
          accent="text-teal-500"
        />
        <StatCard
          label="Environment"
          value={getEnvironmentLabel()}
          icon={Settings}
          accent="text-muted-foreground"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="System Overview" icon={BarChart3}>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow label="Provider" value={getProviderLabel()} />
              <InfoRow label="Environment" value={getEnvironmentLabel()} />
              <InfoRow label="Platform" value={platform} />
              <InfoRow label="Theme" value={resolvedTheme} />
              <InfoRow label="Version" value={config.appVersion} />
              <InfoRow label="Connection" value={isOnline ? 'Online' : 'Offline'} />
            </div>
          </SectionCard>

          <SectionCard title="Backend Services" icon={Shield}>
            <div className="space-y-2">
              <ServiceRow name="Database" icon={Database} status={health?.backend === 'healthy' ? 'healthy' : 'unknown'} />
              <ServiceRow name="Authentication" icon={Shield} status={health?.backend === 'healthy' ? 'healthy' : 'unknown'} />
              <ServiceRow name="Storage" icon={HardDrive} status={health?.backend === 'healthy' ? 'healthy' : 'unknown'} />
              <ServiceRow name="Realtime" icon={Radio} status={health?.backend === 'healthy' ? 'healthy' : 'unknown'} />
              <ServiceRow name="Functions" icon={Zap} status={health?.backend === 'healthy' ? 'healthy' : 'unknown'} />
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Your Account" icon={Shield}>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="text-sm font-semibold">
                    {(user?.displayName || user?.email || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user?.displayName || 'User'}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              {user?.createdAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="Quick Actions" icon={Bell}>
            <div className="space-y-2">
              <QuickAction label="View system info" href="/" />
              <QuickAction label="Read documentation" href="https://github.com/nself-org/cli" external />
            </div>
          </SectionCard>
        </div>
      </div>

      {showDevTools && (
        <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-800 px-5 py-3.5">
            <Code2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
              Developer Tools
            </h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 px-3 py-2">
                <span className="text-xs text-emerald-700 dark:text-emerald-300">Environment</span>
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mt-0.5">
                  {getEnvironmentName()}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 px-3 py-2">
                <span className="text-xs text-emerald-700 dark:text-emerald-300">Test Accounts</span>
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mt-0.5">
                  {getFauxAccounts().length} available
                </p>
              </div>
            </div>
            <div className="rounded-lg bg-emerald-100/50 dark:bg-emerald-900/30 p-3">
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mb-2">Quick Sign-In Accounts:</p>
              <div className="space-y-1">
                {getFauxAccounts().map((account) => (
                  <div key={account.email} className="text-xs font-mono text-emerald-900 dark:text-emerald-100">
                    {account.email} / {account.password}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              These dev tools and test accounts are only visible in development and staging environments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: typeof Activity; accent: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: { title: string; icon: typeof Activity; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card">
      <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium">{value}</span>
    </div>
  );
}

function ServiceRow({ name, icon: Icon, status }: { name: string; icon: typeof Activity; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{name}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${status === 'healthy' ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`} />
        <span className="text-xs text-muted-foreground capitalize">{status}</span>
      </div>
    </div>
  );
}

function QuickAction({ label, href, external }: { label: string; href: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted/50"
    >
      <span>{label}</span>
      <span className="text-muted-foreground">&rarr;</span>
    </a>
  );
}
