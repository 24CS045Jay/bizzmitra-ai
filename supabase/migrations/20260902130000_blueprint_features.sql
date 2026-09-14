-- Migration: Enterprise Blueprint Features (Scenarios & Shareable Links)

CREATE TABLE IF NOT EXISTS public.blueprint_scenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_blueprint_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.blueprint_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.blueprint_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_shares ENABLE ROW LEVEL SECURITY;

-- RLS: blueprint_scenarios
DROP POLICY IF EXISTS "Users can read their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can read their workspace scenarios"
  ON public.blueprint_scenarios
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_workspace_access(parent_blueprint_id)
  );

DROP POLICY IF EXISTS "Users can insert their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can insert their workspace scenarios"
  ON public.blueprint_scenarios
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.has_workspace_access(parent_blueprint_id)
  );

DROP POLICY IF EXISTS "Users can update their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can update their workspace scenarios"
  ON public.blueprint_scenarios
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can delete their workspace scenarios"
  ON public.blueprint_scenarios
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS: blueprint_shares
DROP POLICY IF EXISTS "Public can view active share tokens" ON public.blueprint_shares;
CREATE POLICY "Public can view active share tokens"
  ON public.blueprint_shares
  FOR SELECT
  TO anon, authenticated
  USING (
    expires_at IS NULL OR expires_at > now()
  );

DROP POLICY IF EXISTS "Workspace owners can create shares" ON public.blueprint_shares;
CREATE POLICY "Workspace owners can create shares"
  ON public.blueprint_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_workspace_access(blueprint_id)
  );

DROP POLICY IF EXISTS "Workspace owners can delete shares" ON public.blueprint_shares;
CREATE POLICY "Workspace owners can delete shares"
  ON public.blueprint_shares
  FOR DELETE
  TO authenticated
  USING (
    public.has_workspace_access(blueprint_id)
  );
