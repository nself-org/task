import type { AuthAdapter, User, Session, SignUpCredentials, SignInCredentials } from '@/lib/types/backend';
import { getSupabaseClient } from './client';

function mapUser(supaUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string } | null): User | null {
  if (!supaUser) return null;
  return {
    id: supaUser.id,
    email: supaUser.email || '',
    displayName: (supaUser.user_metadata?.display_name as string) || undefined,
    avatarUrl: (supaUser.user_metadata?.avatar_url as string) || undefined,
    metadata: supaUser.user_metadata,
    createdAt: supaUser.created_at,
  };
}

function mapSession(supaSession: { access_token: string; refresh_token?: string; expires_at?: number; user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at?: string } } | null): Session | null {
  if (!supaSession) return null;
  return {
    accessToken: supaSession.access_token,
    refreshToken: supaSession.refresh_token,
    user: mapUser(supaSession.user)!,
    expiresAt: supaSession.expires_at,
  };
}

export function createSupabaseAuth(): AuthAdapter {
  const client = getSupabaseClient();

  return {
    async signUp(credentials: SignUpCredentials) {
      const { data, error } = await client.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            display_name: credentials.displayName,
            ...credentials.metadata,
          },
        },
      });
      return {
        user: mapUser(data.user),
        session: mapSession(data.session),
        error: error?.message || null,
      };
    },

    async signIn(credentials: SignInCredentials) {
      const { data, error } = await client.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      return {
        user: mapUser(data.user),
        session: mapSession(data.session),
        error: error?.message || null,
      };
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      return { error: error?.message || null };
    },

    async getSession() {
      const { data } = await client.auth.getSession();
      return mapSession(data.session);
    },

    async getUser() {
      const { data } = await client.auth.getUser();
      return mapUser(data.user);
    },

    async resetPassword(email: string) {
      const { error } = await client.auth.resetPasswordForEmail(email);
      return { error: error?.message || null };
    },

    async updateUser(userData: Partial<User>) {
      const { data, error } = await client.auth.updateUser({
        data: {
          display_name: userData.displayName,
          avatar_url: userData.avatarUrl,
          ...userData.metadata,
        },
      });
      return { user: mapUser(data.user), error: error?.message || null };
    },

    onAuthStateChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => {
        const user = mapUser(session?.user ?? null);
        const mappedSession = mapSession(session);
        callback(user, mappedSession);
      });
      return () => data.subscription.unsubscribe();
    },

    signInWithProvider(provider: string, redirectTo?: string) {
      const callbackUrl = redirectTo || `${window.location.origin}/auth/callback`;
      void client.auth.signInWithOAuth({
        provider: provider as Parameters<typeof client.auth.signInWithOAuth>[0]['provider'],
        options: { redirectTo: callbackUrl },
      });
    },

    async getSessionFromUrl() {
      const { data, error } = await client.auth.getSession();
      if (error) return { session: null, error: error.message };
      return { session: mapSession(data.session), error: null };
    },
  };
}
