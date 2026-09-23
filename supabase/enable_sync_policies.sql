-- ==============================================================================
-- BizzMitra AI: Sync All Webportal Information to Supabase Database
-- Run this script in: Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Ensure owner_id is flexible (allows guest/team/demo accounts to save workspaces)
ALTER TABLE IF EXISTS public.workspaces ALTER COLUMN owner_id DROP NOT NULL;
ALTER TABLE IF EXISTS public.workspaces DROP CONSTRAINT IF EXISTS workspaces_owner_id_fkey;
ALTER TABLE IF EXISTS public.workspaces 
  ADD CONSTRAINT workspaces_owner_id_fkey 
  FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Grant full table permissions to authenticated and anon roles
GRANT ALL ON TABLE public.workspaces TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.artifacts TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.profiles TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.discovery_messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.uploaded_documents TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.blueprint_scenarios TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.blueprint_shares TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.workspace_members TO anon, authenticated, service_role;

-- 3. Workspaces RLS Policies (Allow direct insert, select, update)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workspaces_all_policy" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_insert_owner" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_select_accessible" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_update_accessible" ON public.workspaces;
DROP POLICY IF EXISTS "workspaces_delete_accessible" ON public.workspaces;

CREATE POLICY "workspaces_all_policy" ON public.workspaces
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Artifacts RLS Policies (Allow all generated modules to save)
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "artifacts_all_policy" ON public.artifacts;
DROP POLICY IF EXISTS "artifacts_select_accessible" ON public.artifacts;
DROP POLICY IF EXISTS "artifacts_insert_accessible" ON public.artifacts;
DROP POLICY IF EXISTS "artifacts_update_accessible" ON public.artifacts;

CREATE POLICY "artifacts_all_policy" ON public.artifacts
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. Profiles RLS Policies (Allow profile creation & sync)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_all_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_self_or_workspace_members" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON public.profiles;

CREATE POLICY "profiles_all_policy" ON public.profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 6. Discovery Messages & Documents Policies
ALTER TABLE public.discovery_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "discovery_messages_all_policy" ON public.discovery_messages;
CREATE POLICY "discovery_messages_all_policy" ON public.discovery_messages
  FOR ALL
  USING (true)
  WITH CHECK (true);

ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "uploaded_documents_all_policy" ON public.uploaded_documents;
CREATE POLICY "uploaded_documents_all_policy" ON public.uploaded_documents
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 7. Ensure module_type constraint supports all pipeline modules
ALTER TABLE public.artifacts DROP CONSTRAINT IF EXISTS artifacts_module_type_check;
ALTER TABLE public.artifacts ADD CONSTRAINT artifacts_module_type_check CHECK (
  module_type IN ('framing', 'solution', 'stack', 'architecture', 'process', 'ux', 'data', 'roadmap', 'discovery', 'summary', 'roi')
);
