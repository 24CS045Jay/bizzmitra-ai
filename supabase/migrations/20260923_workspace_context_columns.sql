-- ==============================================================================
-- BizzMitra AI — Migration: Workspace Full Context Persistence
-- Run in: Supabase Dashboard → SQL Editor → New Query → Run
-- Safe to re-run (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ==============================================================================

-- 1. Add missing context columns to workspaces table
ALTER TABLE public.workspaces
  ADD COLUMN IF NOT EXISTS goals TEXT,
  ADD COLUMN IF NOT EXISTS constraints_text TEXT,
  ADD COLUMN IF NOT EXISTS intake_mode TEXT DEFAULT 'consult',
  ADD COLUMN IF NOT EXISTS intake_method TEXT DEFAULT 'prompt',
  ADD COLUMN IF NOT EXISTS language_code TEXT DEFAULT 'en',
  ADD COLUMN IF NOT EXISTS workspace_context JSONB DEFAULT '{}'::jsonb;

-- 2. Add index on owner_id for fast per-user workspace lookups
CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id
  ON public.workspaces (owner_id);

-- 3. Add index on updated_at for ordering
CREATE INDEX IF NOT EXISTS idx_workspaces_updated_at
  ON public.workspaces (updated_at DESC);

-- 4. Backfill: ensure existing rows have default values
UPDATE public.workspaces
SET
  intake_mode    = COALESCE(intake_mode, 'consult'),
  intake_method  = COALESCE(intake_method, 'prompt'),
  language_code  = COALESCE(language_code, 'en'),
  workspace_context = COALESCE(workspace_context, '{}'::jsonb)
WHERE intake_mode IS NULL
   OR intake_method IS NULL
   OR language_code IS NULL
   OR workspace_context IS NULL;

-- 5. Grant SELECT on new columns to authenticated users
GRANT SELECT (
  id, owner_id, name, problem_statement, industry, status,
  maturity_score, ai_readiness_score, goals, constraints_text,
  intake_mode, intake_method, language_code, workspace_context,
  created_at, updated_at
) ON public.workspaces TO authenticated;

-- Done! Verify with:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'workspaces' AND table_schema = 'public'
-- ORDER BY ordinal_position;
