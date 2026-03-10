-- Migration 006: List Groups
-- Groups are named collections of lists (e.g. "Work", "Personal")

CREATE TABLE IF NOT EXISTS public.app_list_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT 'folder',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add group_id to app_lists (nullable — lists can be ungrouped)
ALTER TABLE public.app_lists
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.app_list_groups(id) ON DELETE SET NULL;

-- RLS for app_list_groups
ALTER TABLE public.app_list_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own groups"
  ON public.app_list_groups FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groups"
  ON public.app_list_groups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
  ON public.app_list_groups FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
  ON public.app_list_groups FOR DELETE
  USING (auth.uid() = user_id);

-- Updated_at trigger for app_list_groups
CREATE OR REPLACE FUNCTION update_app_list_groups_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_app_list_groups_updated_at
  BEFORE UPDATE ON public.app_list_groups
  FOR EACH ROW EXECUTE FUNCTION update_app_list_groups_updated_at();
