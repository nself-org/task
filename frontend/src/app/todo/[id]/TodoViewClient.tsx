'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/providers';
import { AppHeader } from '@/components/layout/app-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, Circle, Lock, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { todoService, type Todo } from '@/lib/services/todos';

export default function TodoViewClient() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    async function fetchTodo() {
      try {
        setLoading(true);
        setError(null);
        const data = await todoService.getTodoById(id);

        if (!data) {
          setError('Todo not found');
          return;
        }

        // Check access: public todos are viewable by anyone,
        // private todos require being the owner or shared with
        if (!data.is_public && (!user || data.user_id !== user.id)) {
          // Could also check shares here, but for now: owner or public
          setError('This todo is private. You need permission to view it.');
          return;
        }

        setTodo(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    // Wait for auth to settle before checking access
    if (!authLoading) {
      fetchTodo();
    }
  }, [id, user, authLoading]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="mx-auto max-w-2xl px-4 py-16">
        {loading || authLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h1 className="mb-2 text-xl font-bold">{error}</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {!user
                ? 'Try signing in to access this todo.'
                : 'Ask the owner to share this todo with you or make it public.'}
            </p>
            <div className="flex items-center justify-center gap-3">
              {!user && (
                <Button asChild>
                  <Link href={`/login?redirect=/todo/${id}`}>Sign in</Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go home
                </Link>
              </Button>
            </div>
          </div>
        ) : todo ? (
          <>
            <div className="mb-6">
              <Button variant="ghost" size="sm" asChild>
                <Link href={user ? '/todos' : '/'}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {todo.completed ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <CardTitle
                        className={todo.completed ? 'line-through text-muted-foreground' : ''}
                      >
                        {todo.title}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {todo.is_public ? (
                      <Badge variant="secondary">
                        <Globe className="mr-1 h-3 w-3" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Lock className="mr-1 h-3 w-3" />
                        Private
                      </Badge>
                    )}
                    {todo.completed && (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Created</span>
                    <span>{new Date(todo.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}</span>
                  </div>
                  {todo.updated_at && todo.updated_at !== todo.created_at && (
                    <div className="flex items-center justify-between">
                      <span>Updated</span>
                      <span>{new Date(todo.updated_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}
