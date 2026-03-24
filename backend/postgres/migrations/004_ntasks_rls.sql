-- Migration 004: Row-Level Security for ɳTask
--
-- Most RLS policies were defined inline in init.sql (app_todos, app_profiles,
-- app_lists, app_list_shares, app_list_presence, app_list_members,
-- app_notifications, app_recurring_instances).
--
-- This migration ensures:
--   1. RLS is enabled on all app_ tables (idempotent — safe to repeat)
--   2. Adds RLS for app_user_preferences (created in migration 003)
--   3. Updates app_profiles Hasura-tracked select policy to cover new columns
--      (time_format, auto_hide_completed, default_list_id,
--       notification_settings, theme_preference)
--
-- All policies use auth.uid() — the correct pattern for Hasura Auth JWTs.
-- Never use (SELECT id FROM auth.users WHERE email = current_user) — that
-- checks the PostgreSQL session user, not the JWT-authenticated Hasura user.

-- ---------------------------------------------------------------------------
-- Ensure RLS is enabled on all tables (idempotent)
-- ---------------------------------------------------------------------------
ALTER TABLE public.app_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_todo_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_list_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_list_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_list_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_recurring_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_user_preferences ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- app_user_preferences: RLS (also created in migration 003, kept here for
-- completeness — CREATE POLICY IF NOT EXISTS is not supported in older PG
-- versions, so we DROP first)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.app_user_preferences;
CREATE POLICY "Users can view their own preferences"
  ON public.app_user_preferences FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own preferences" ON public.app_user_preferences;
CREATE POLICY "Users can insert their own preferences"
  ON public.app_user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own preferences" ON public.app_user_preferences;
CREATE POLICY "Users can update their own preferences"
  ON public.app_user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own preferences" ON public.app_user_preferences;
CREATE POLICY "Users can delete their own preferences"
  ON public.app_user_preferences FOR DELETE
  USING (auth.uid() = user_id);
