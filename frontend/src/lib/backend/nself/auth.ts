import type { AuthAdapter, User, Session, SignUpCredentials, SignInCredentials } from '@/lib/types/backend';
import { config } from '@/lib/config';
import { updateGraphQLToken } from './graphql-client';

const TOKEN_KEY = 'nself_auth_token';
const REFRESH_KEY = 'nself_refresh_token';
const USER_KEY = 'nself_user';

type AuthChangeCallback = (user: User | null, session: Session | null) => void;
const listeners: Set<AuthChangeCallback> = new Set();

function notifyListeners(user: User | null, session: Session | null) {
  listeners.forEach((cb) => cb(user, session));
}

function storeSession(session: Session | null) {
  if (typeof window === 'undefined') return;
  if (session) {
    localStorage.setItem(TOKEN_KEY, session.accessToken);
    if (session.refreshToken) localStorage.setItem(REFRESH_KEY, session.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(session.user));
    updateGraphQLToken(session.accessToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    updateGraphQLToken(null);
  }
}

function getStoredSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  if (!token || !userStr) return null;
  try {
    const user = JSON.parse(userStr) as User;
    return {
      accessToken: token,
      refreshToken: localStorage.getItem(REFRESH_KEY) || undefined,
      user,
    };
  } catch {
    return null;
  }
}

async function nselfRequest<T>(endpoint: string, body: Record<string, unknown>, token?: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${config.nself.authUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      return { data: null, error: err.message || err.error || 'Request failed' };
    }

    const data = await res.json();
    return { data: data as T, error: null };
  } catch (err) {
    return { data: null, error: (err as Error).message };
  }
}

interface NselfAuthResponse {
  session?: {
    accessToken: string;
    accessTokenExpiresIn: number;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      displayName?: string;
      avatarUrl?: string;
      metadata?: Record<string, unknown>;
      createdAt?: string;
    };
  };
  mfa?: { ticket: string };
}

function mapNselfResponse(res: NselfAuthResponse): { user: User | null; session: Session | null } {
  if (!res.session) return { user: null, session: null };
  const user: User = {
    id: res.session.user.id,
    email: res.session.user.email,
    displayName: res.session.user.displayName,
    avatarUrl: res.session.user.avatarUrl,
    metadata: res.session.user.metadata,
    createdAt: res.session.user.createdAt,
  };
  const session: Session = {
    accessToken: res.session.accessToken,
    refreshToken: res.session.refreshToken,
    user,
    expiresAt: Date.now() + res.session.accessTokenExpiresIn * 1000,
  };
  return { user, session };
}

export function createNselfAuth(): AuthAdapter {
  return {
    async signUp(credentials: SignUpCredentials) {
      const { data, error } = await nselfRequest<NselfAuthResponse>('/signup/email-password', {
        email: credentials.email,
        password: credentials.password,
        options: {
          displayName: credentials.displayName,
          metadata: credentials.metadata,
        },
      });

      if (error || !data) return { user: null, session: null, error: error || 'Signup failed' };
      const mapped = mapNselfResponse(data);
      storeSession(mapped.session);
      notifyListeners(mapped.user, mapped.session);
      return { ...mapped, error: null };
    },

    async signIn(credentials: SignInCredentials) {
      const { data, error } = await nselfRequest<NselfAuthResponse>('/signin/email-password', {
        email: credentials.email,
        password: credentials.password,
      });

      if (error || !data) return { user: null, session: null, error: error || 'Signin failed' };
      const mapped = mapNselfResponse(data);
      storeSession(mapped.session);
      notifyListeners(mapped.user, mapped.session);
      return { ...mapped, error: null };
    },

    async signOut() {
      const session = getStoredSession();
      if (session) {
        await nselfRequest('/signout', {}, session.accessToken).catch(() => {});
      }
      storeSession(null);
      notifyListeners(null, null);
      return { error: null };
    },

    async getSession() {
      const stored = getStoredSession();
      if (!stored) return null;

      if (stored.expiresAt && Date.now() > (stored.expiresAt - 60000)) {
        const { data } = await nselfRequest<NselfAuthResponse>('/token', {
          refreshToken: stored.refreshToken,
        });
        if (data) {
          const mapped = mapNselfResponse(data);
          storeSession(mapped.session);
          return mapped.session;
        }
      }
      return stored;
    },

    async getUser() {
      const session = getStoredSession();
      return session?.user || null;
    },

    async resetPassword(email: string) {
      const { error } = await nselfRequest('/user/password/reset', { email });
      return { error };
    },

    async updateUser(userData: Partial<User>) {
      const session = getStoredSession();
      if (!session) return { user: null, error: 'Not authenticated' };

      const { data, error } = await nselfRequest<{ user: User }>('/user', {
        displayName: userData.displayName,
        avatarUrl: userData.avatarUrl,
        metadata: userData.metadata,
      }, session.accessToken);

      if (error || !data) return { user: null, error: error || 'Update failed' };
      const updatedUser = { ...session.user, ...data.user };
      storeSession({ ...session, user: updatedUser });
      return { user: updatedUser, error: null };
    },

    onAuthStateChange(callback) {
      listeners.add(callback);

      const session = getStoredSession();
      if (session) {
        setTimeout(() => callback(session.user, session), 0);
      }

      return () => {
        listeners.delete(callback);
      };
    },

    signInWithProvider(provider: string, redirectTo?: string) {
      const callbackUrl = redirectTo || `${window.location.origin}/auth/callback`;
      window.location.href = `${config.nself.authUrl}/signin/provider/${provider}?redirectTo=${encodeURIComponent(callbackUrl)}`;
    },

    async getSessionFromUrl() {
      if (typeof window === 'undefined') return { session: null, error: null };

      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const errorDescription = params.get('error_description');

      if (errorDescription) return { session: null, error: decodeURIComponent(errorDescription) };
      if (!accessToken) {
        const searchError = new URLSearchParams(window.location.search).get('error_description');
        if (searchError) return { session: null, error: decodeURIComponent(searchError) };
        return { session: null, error: null };
      }

      try {
        const res = await fetch(`${config.nself.authUrl}/user`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) return { session: null, error: 'Failed to fetch user after OAuth' };
        const userData = await res.json() as {
          id: string; email: string; displayName?: string;
          avatarUrl?: string; metadata?: Record<string, unknown>; createdAt?: string;
        };
        const user: User = {
          id: userData.id,
          email: userData.email,
          displayName: userData.displayName,
          avatarUrl: userData.avatarUrl,
          metadata: userData.metadata,
          createdAt: userData.createdAt,
        };
        const session: Session = { accessToken, refreshToken: refreshToken || undefined, user };
        storeSession(session);
        notifyListeners(user, session);
        return { session, error: null };
      } catch (err) {
        return { session: null, error: (err as Error).message };
      }
    },
  };
}
