-- ==============================================================================
-- BizzMitra AI - Supabase Database Initial Setup
-- Copy and run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  company TEXT,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Workspaces Table
CREATE TABLE IF NOT EXISTS public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  problem_statement TEXT,
  industry TEXT,
  goals TEXT,
  constraints_text TEXT,
  intake_mode TEXT DEFAULT 'consult',
  intake_method TEXT DEFAULT 'prompt',
  language_code TEXT DEFAULT 'en',
  workspace_context JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  maturity_score INT NOT NULL DEFAULT 0,
  ai_readiness_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Workspace Members Table
CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- 4. Artifacts Table
CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  module_type TEXT NOT NULL CHECK (
    module_type IN ('framing', 'solution', 'stack', 'architecture', 'process', 'ux', 'data', 'roadmap')
  ),
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Discovery Messages Table
CREATE TABLE IF NOT EXISTS public.discovery_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Uploaded Documents Table
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Enterprise Blueprint Features (Scenarios & Shareable Links)
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

-- ==============================================================================
-- Helper Functions & Triggers
-- ==============================================================================

-- Access checking function
CREATE OR REPLACE FUNCTION public.has_workspace_access(target_workspace_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE w.id = target_workspace_id
      AND (
        w.owner_id = auth.uid()
        OR EXISTS (
          SELECT 1 FROM public.workspace_members wm
          WHERE wm.workspace_id = w.id AND wm.user_id = auth.uid()
        )
      )
  );
$$;

REVOKE EXECUTE ON FUNCTION public.has_workspace_access(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_workspace_access(UUID) TO authenticated;

-- Timestamp auto-update trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS workspaces_set_updated_at ON public.workspaces;
CREATE TRIGGER workspaces_set_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile upon Auth user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', 'free')
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- Row Level Security (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blueprint_shares ENABLE ROW LEVEL SECURITY;

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles, public.workspaces, public.workspace_members,
  public.artifacts, public.discovery_messages, public.uploaded_documents,
  public.blueprint_scenarios, public.blueprint_shares
TO authenticated;

GRANT ALL ON
  public.profiles, public.workspaces, public.workspace_members,
  public.artifacts, public.discovery_messages, public.uploaded_documents,
  public.blueprint_scenarios, public.blueprint_shares
TO service_role;

-- Profiles Policies
DROP POLICY IF EXISTS "profiles_select_self_or_workspace_members" ON public.profiles;
CREATE POLICY "profiles_select_self_or_workspace_members" ON public.profiles
FOR SELECT TO authenticated USING (
  id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.workspaces w
    WHERE public.has_workspace_access(w.id)
      AND (w.owner_id = public.profiles.id OR EXISTS (
        SELECT 1 FROM public.workspace_members wm
        WHERE wm.workspace_id = w.id AND wm.user_id = public.profiles.id
      ))
  )
);

DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;
CREATE POLICY "profiles_update_self" ON public.profiles
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- Workspaces Policies
DROP POLICY IF EXISTS "workspaces_select_accessible" ON public.workspaces;
CREATE POLICY "workspaces_select_accessible" ON public.workspaces
FOR SELECT TO authenticated USING (public.has_workspace_access(id));

DROP POLICY IF EXISTS "workspaces_insert_owner" ON public.workspaces;
CREATE POLICY "workspaces_insert_owner" ON public.workspaces
FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "workspaces_update_accessible" ON public.workspaces;
CREATE POLICY "workspaces_update_accessible" ON public.workspaces
FOR UPDATE TO authenticated USING (public.has_workspace_access(id))
WITH CHECK (public.has_workspace_access(id));

DROP POLICY IF EXISTS "workspaces_delete_accessible" ON public.workspaces;
CREATE POLICY "workspaces_delete_accessible" ON public.workspaces
FOR DELETE TO authenticated USING (public.has_workspace_access(id));

-- Workspace Members Policies
DROP POLICY IF EXISTS "workspace_members_select_accessible" ON public.workspace_members;
CREATE POLICY "workspace_members_select_accessible" ON public.workspace_members
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "workspace_members_insert_owner" ON public.workspace_members;
CREATE POLICY "workspace_members_insert_owner" ON public.workspace_members
FOR INSERT TO authenticated WITH CHECK (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "workspace_members_update_owner" ON public.workspace_members;
CREATE POLICY "workspace_members_update_owner" ON public.workspace_members
FOR UPDATE TO authenticated USING (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));

DROP POLICY IF EXISTS "workspace_members_delete_owner" ON public.workspace_members;
CREATE POLICY "workspace_members_delete_owner" ON public.workspace_members
FOR DELETE TO authenticated USING (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));

-- Artifacts Policies
DROP POLICY IF EXISTS "artifacts_select_accessible" ON public.artifacts;
CREATE POLICY "artifacts_select_accessible" ON public.artifacts
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "artifacts_insert_accessible" ON public.artifacts;
CREATE POLICY "artifacts_insert_accessible" ON public.artifacts
FOR INSERT TO authenticated WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "artifacts_update_accessible" ON public.artifacts;
CREATE POLICY "artifacts_update_accessible" ON public.artifacts
FOR UPDATE TO authenticated USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "artifacts_delete_accessible" ON public.artifacts;
CREATE POLICY "artifacts_delete_accessible" ON public.artifacts
FOR DELETE TO authenticated USING (public.has_workspace_access(workspace_id));

-- Discovery Messages Policies
DROP POLICY IF EXISTS "discovery_messages_select_accessible" ON public.discovery_messages;
CREATE POLICY "discovery_messages_select_accessible" ON public.discovery_messages
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "discovery_messages_insert_accessible" ON public.discovery_messages;
CREATE POLICY "discovery_messages_insert_accessible" ON public.discovery_messages
FOR INSERT TO authenticated WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "discovery_messages_update_accessible" ON public.discovery_messages;
CREATE POLICY "discovery_messages_update_accessible" ON public.discovery_messages
FOR UPDATE TO authenticated USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "discovery_messages_delete_accessible" ON public.discovery_messages;
CREATE POLICY "discovery_messages_delete_accessible" ON public.discovery_messages
FOR DELETE TO authenticated USING (public.has_workspace_access(workspace_id));

-- Uploaded Documents Policies
DROP POLICY IF EXISTS "uploaded_documents_select_accessible" ON public.uploaded_documents;
CREATE POLICY "uploaded_documents_select_accessible" ON public.uploaded_documents
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "uploaded_documents_insert_accessible" ON public.uploaded_documents;
CREATE POLICY "uploaded_documents_insert_accessible" ON public.uploaded_documents
FOR INSERT TO authenticated WITH CHECK (public.has_workspace_access(workspace_id));

DROP POLICY IF EXISTS "uploaded_documents_delete_accessible" ON public.uploaded_documents;
CREATE POLICY "uploaded_documents_delete_accessible" ON public.uploaded_documents
FOR DELETE TO authenticated USING (public.has_workspace_access(workspace_id));

-- Blueprint Scenarios Policies
DROP POLICY IF EXISTS "Users can read their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can read their workspace scenarios"
  ON public.blueprint_scenarios FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_workspace_access(parent_blueprint_id));

DROP POLICY IF EXISTS "Users can insert their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can insert their workspace scenarios"
  ON public.blueprint_scenarios FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_workspace_access(parent_blueprint_id));

DROP POLICY IF EXISTS "Users can update their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can update their workspace scenarios"
  ON public.blueprint_scenarios FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their workspace scenarios" ON public.blueprint_scenarios;
CREATE POLICY "Users can delete their workspace scenarios"
  ON public.blueprint_scenarios FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Blueprint Shares Policies
DROP POLICY IF EXISTS "Public can view active share tokens" ON public.blueprint_shares;
CREATE POLICY "Public can view active share tokens"
  ON public.blueprint_shares FOR SELECT TO anon, authenticated
  USING (expires_at IS NULL OR expires_at > now());

DROP POLICY IF EXISTS "Workspace owners can create shares" ON public.blueprint_shares;
CREATE POLICY "Workspace owners can create shares"
  ON public.blueprint_shares FOR INSERT TO authenticated
  WITH CHECK (public.has_workspace_access(blueprint_id));

DROP POLICY IF EXISTS "Workspace owners can delete shares" ON public.blueprint_shares;
CREATE POLICY "Workspace owners can delete shares"
  ON public.blueprint_shares FOR DELETE TO authenticated
  USING (public.has_workspace_access(blueprint_id));

-- ==============================================================================
-- Storage Bucket & Storage RLS Policies
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-documents', 'workspace-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "workspace_documents_select" ON storage.objects;
CREATE POLICY "workspace_documents_select" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);

DROP POLICY IF EXISTS "workspace_documents_insert" ON storage.objects;
CREATE POLICY "workspace_documents_insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);

DROP POLICY IF EXISTS "workspace_documents_update" ON storage.objects;
CREATE POLICY "workspace_documents_update" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
) WITH CHECK (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);

DROP POLICY IF EXISTS "workspace_documents_delete" ON storage.objects;
CREATE POLICY "workspace_documents_delete" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);
