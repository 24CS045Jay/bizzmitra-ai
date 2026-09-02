-- Round 3: persisted workspaces, artifacts, discovery, members, and documents.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

ALTER TABLE public.workspaces RENAME COLUMN user_id TO owner_id;
ALTER TABLE public.workspaces RENAME COLUMN problem TO problem_statement;
ALTER TABLE public.workspaces RENAME COLUMN readiness_score TO ai_readiness_score;
ALTER TABLE public.artifacts RENAME COLUMN kind TO module_type;
ALTER TABLE public.messages RENAME TO discovery_messages;

DROP POLICY IF EXISTS "own artifacts" ON public.artifacts;
DROP POLICY IF EXISTS "own messages" ON public.discovery_messages;
ALTER TABLE public.discovery_messages DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.artifacts DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.workspaces ALTER COLUMN status SET DEFAULT 'active';

CREATE TABLE IF NOT EXISTS public.workspace_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.discovery_messages
  ADD CONSTRAINT discovery_messages_role_check CHECK (role IN ('user', 'ai'));

ALTER TABLE public.artifacts
  ADD CONSTRAINT artifacts_module_type_check CHECK (
    module_type IN ('framing', 'solution', 'stack', 'architecture', 'process', 'ux', 'data', 'roadmap')
  );

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

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.profiles, public.workspaces, public.workspace_members,
  public.artifacts, public.discovery_messages, public.uploaded_documents
TO authenticated;
GRANT ALL ON
  public.profiles, public.workspaces, public.workspace_members,
  public.artifacts, public.discovery_messages, public.uploaded_documents
TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own profile" ON public.profiles;
DROP POLICY IF EXISTS "own workspaces" ON public.workspaces;

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
CREATE POLICY "profiles_update_self" ON public.profiles
FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "workspaces_select_accessible" ON public.workspaces
FOR SELECT TO authenticated USING (public.has_workspace_access(id));
CREATE POLICY "workspaces_insert_owner" ON public.workspaces
FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "workspaces_update_accessible" ON public.workspaces
FOR UPDATE TO authenticated USING (public.has_workspace_access(id))
WITH CHECK (public.has_workspace_access(id));
CREATE POLICY "workspaces_delete_accessible" ON public.workspaces
FOR DELETE TO authenticated USING (public.has_workspace_access(id));

CREATE POLICY "workspace_members_select_accessible" ON public.workspace_members
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));
CREATE POLICY "workspace_members_insert_owner" ON public.workspace_members
FOR INSERT TO authenticated WITH CHECK (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));
CREATE POLICY "workspace_members_update_owner" ON public.workspace_members
FOR UPDATE TO authenticated USING (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
)) WITH CHECK (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));
CREATE POLICY "workspace_members_delete_owner" ON public.workspace_members
FOR DELETE TO authenticated USING (EXISTS (
  SELECT 1 FROM public.workspaces w WHERE w.id = workspace_id AND w.owner_id = auth.uid()
));

CREATE POLICY "artifacts_select_accessible" ON public.artifacts
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));
CREATE POLICY "artifacts_insert_accessible" ON public.artifacts
FOR INSERT TO authenticated WITH CHECK (public.has_workspace_access(workspace_id));
CREATE POLICY "artifacts_update_accessible" ON public.artifacts
FOR UPDATE TO authenticated USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));
CREATE POLICY "artifacts_delete_accessible" ON public.artifacts
FOR DELETE TO authenticated USING (public.has_workspace_access(workspace_id));

CREATE POLICY "discovery_messages_select_accessible" ON public.discovery_messages
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));
CREATE POLICY "discovery_messages_insert_accessible" ON public.discovery_messages
FOR INSERT TO authenticated WITH CHECK (public.has_workspace_access(workspace_id));
CREATE POLICY "discovery_messages_update_accessible" ON public.discovery_messages
FOR UPDATE TO authenticated USING (public.has_workspace_access(workspace_id))
WITH CHECK (public.has_workspace_access(workspace_id));
CREATE POLICY "discovery_messages_delete_accessible" ON public.discovery_messages
FOR DELETE TO authenticated USING (public.has_workspace_access(workspace_id));

CREATE POLICY "uploaded_documents_select_accessible" ON public.uploaded_documents
FOR SELECT TO authenticated USING (public.has_workspace_access(workspace_id));
CREATE POLICY "uploaded_documents_insert_accessible" ON public.uploaded_documents
FOR INSERT TO authenticated WITH CHECK (public.has_workspace_access(workspace_id));
CREATE POLICY "uploaded_documents_delete_accessible" ON public.uploaded_documents
FOR DELETE TO authenticated USING (public.has_workspace_access(workspace_id));

INSERT INTO storage.buckets (id, name, public)
VALUES ('workspace-documents', 'workspace-documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "workspace_documents_select" ON storage.objects
FOR SELECT TO authenticated USING (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);
CREATE POLICY "workspace_documents_insert" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);
CREATE POLICY "workspace_documents_update" ON storage.objects
FOR UPDATE TO authenticated USING (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
) WITH CHECK (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);
CREATE POLICY "workspace_documents_delete" ON storage.objects
FOR DELETE TO authenticated USING (
  bucket_id = 'workspace-documents'
  AND public.has_workspace_access((storage.foldername(name))[1]::UUID)
);
