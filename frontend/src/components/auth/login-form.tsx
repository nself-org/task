'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/providers';
import { getEnabledAuthMethods, hasEmailPassword, hasMagicLink, getSocialMethods, hasSocialAuth } from '@/lib/auth-config';
import { emailSchema, passwordSchema } from '@/lib/form-utils';
import { AuthFormField } from './auth-form-field';
import { SocialAuthButton } from './social-auth-button';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const { signIn, signInWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [magicEmail, setMagicEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const showEmail = hasEmailPassword();
  const showMagic = hasMagicLink();
  const socialMethods = getSocialMethods();
  const showSocial = hasSocialAuth();

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    const newErrors: Record<string, string> = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;

    if (password.length === 0) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    const { error } = await signIn({ email, password });
    setLoading(false);

    if (error) {
      setGlobalError(error);
    } else {
      onSuccess?.();
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setGlobalError('');
    const result = emailSchema.safeParse(magicEmail);
    if (!result.success) {
      setErrors({ magicEmail: result.error.errors[0].message });
      return;
    }
    setErrors({});
    setLoading(true);
    setMagicLinkSent(true);
    setLoading(false);
  }

  function handleSocialLogin(method: string) {
    signInWithProvider(method);
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your account</p>
      </div>

      {globalError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {globalError}
        </div>
      )}

      {showEmail && (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <AuthFormField
            id="login-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            error={errors.email}
            autoComplete="email"
            disabled={loading}
          />
          <AuthFormField
            id="login-password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>
        </form>
      )}

      {showMagic && showEmail && <Divider text="or" />}

      {showMagic && !magicLinkSent && (
        <form onSubmit={handleMagicLink} className="space-y-4">
          <AuthFormField
            id="magic-email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={magicEmail}
            onChange={setMagicEmail}
            error={errors.magicEmail}
            autoComplete="email"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send magic link
          </button>
        </form>
      )}

      {showMagic && magicLinkSent && (
        <div className="rounded-lg border border-border bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          Check your email for a magic link to sign in.
        </div>
      )}

      {showSocial && (showEmail || showMagic) && <Divider text="or continue with" />}

      {showSocial && (
        <div className="space-y-2.5">
          {socialMethods.map((method) => (
            <SocialAuthButton
              key={method.id}
              method={method.id}
              label={method.label}
              onClick={() => handleSocialLogin(method.id)}
              disabled={loading}
            />
          ))}
        </div>
      )}

      {onRegisterClick && (
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button onClick={onRegisterClick} className="font-medium text-foreground underline-offset-4 hover:underline">
            Create one
          </button>
        </p>
      )}
    </div>
  );
}

function Divider({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">{text}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
