'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AuthState, User, Session, SignUpCredentials, SignInCredentials } from '@/lib/types/backend';
import { useBackend } from './backend-provider';

interface AuthContextValue extends AuthState {
  signUp: (credentials: SignUpCredentials) => Promise<{ error: string | null }>;
  signIn: (credentials: SignInCredentials) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updateUser: (data: Partial<User>) => Promise<{ error: string | null }>;
  signInWithProvider: (provider: string, redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { auth } = useBackend();
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    auth.getSession().then((session) => {
      if (!mounted) return;
      setState({
        user: session?.user || null,
        session,
        loading: false,
        error: null,
      });
    });

    const unsubscribe = auth.onAuthStateChange((user: User | null, session: Session | null) => {
      if (!mounted) return;
      setState({ user, session, loading: false, error: null });
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [auth]);

  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await auth.signUp(credentials);
    if (error) setState((s) => ({ ...s, loading: false, error }));
    return { error };
  }, [auth]);

  const signIn = useCallback(async (credentials: SignInCredentials) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    const { error } = await auth.signIn(credentials);
    if (error) setState((s) => ({ ...s, loading: false, error }));
    return { error };
  }, [auth]);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setState({ user: null, session: null, loading: false, error: null });
  }, [auth]);

  const resetPassword = useCallback(async (email: string) => {
    return auth.resetPassword(email);
  }, [auth]);

  const updateUser = useCallback(async (data: Partial<User>) => {
    const { user, error } = await auth.updateUser(data);
    if (user) setState((s) => ({ ...s, user }));
    return { error };
  }, [auth]);

  const signInWithProvider = useCallback((provider: string, redirectTo?: string) => {
    auth.signInWithProvider(provider, redirectTo);
  }, [auth]);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, resetPassword, updateUser, signInWithProvider }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
