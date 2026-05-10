-- ============================================================================================== --
-- PHASE 1: USER GOVERNANCE & SOFT-BAN SYSTEM
-- ============================================================================================== --

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. PROFILES TABLE GOVERNANCE COLUMNS
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS banned_at timestamptz,
  ADD COLUMN IF NOT EXISTS banned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS banned_reason text;

-- Migrate existing data (Safe translation from boolean is_approved and role='banned')
UPDATE public.profiles
SET status = CASE
  WHEN role = 'banned' THEN 'banned'
  WHEN is_approved = true THEN 'active'
  ELSE 'pending'
END;

-- Enforce status values to block arbitrary text
ALTER TABLE public.profiles
  ADD CONSTRAINT valid_profile_status CHECK (status IN ('active', 'pending', 'banned', 'suspended'));


-- 3. PRIVILEGE ESCALATION TRIGGER
-- Guards sensitive columns from being updated by client-side requests (authenticated or anon)
CREATE OR REPLACE FUNCTION public.prevent_privilege_escalation()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_role text;
BEGIN
  -- Get the current request role. Service Role queries might not have this in claims, 
  -- but they run as 'service_role' or 'postgres' current_user.
  BEGIN
    v_role := current_setting('request.jwt.claims', true)::json->>'role';
  EXCEPTION WHEN OTHERS THEN
    v_role := null;
  END;
  
  -- Allow mutations if executed directly by superuser or service_role
  IF current_user IN ('postgres', 'service_role', 'supabase_admin') OR v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Block mutations from client side for sensitive governance columns
  NEW.role := OLD.role;
  NEW.status := OLD.status;
  NEW.is_approved := OLD.is_approved;
  NEW.banned_at := OLD.banned_at;
  NEW.banned_by := OLD.banned_by;
  NEW.banned_reason := OLD.banned_reason;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_privilege_escalation();


-- 4. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_admin_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action text NOT NULL,
  previous_state jsonb,
  new_state jsonb,
  reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_admin_action CHECK (
    action IN (
      'approve_user', 
      'revoke_approval', 
      'ban_user', 
      'unban_user', 
      'suspend_user', 
      'unsuspend_user', 
      'change_role', 
      'update_admin_note'
    )
  )
);

-- RLS for audit logs (Only viewable by Admins)
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = (select auth.uid()) AND role = 'admin'
    )
  );

-- Explicitly DENY client inserts/updates/deletes as a firm contract.
-- Only Service Role can insert (Service Role bypasses RLS).
CREATE POLICY "Clients cannot insert audit logs" ON public.admin_audit_logs FOR INSERT WITH CHECK (false);
CREATE POLICY "Clients cannot update audit logs" ON public.admin_audit_logs FOR UPDATE USING (false);
CREATE POLICY "Clients cannot delete audit logs" ON public.admin_audit_logs FOR DELETE USING (false);


-- 5. INDEXES FOR PAGINATION & SEARCH
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- GIN Trgm index for text search on username and email (assuming email is available in profiles, otherwise username)
CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm ON public.profiles USING GIN (username gin_trgm_ops);

-- Dynamically check if 'email' column exists before creating the index to prevent migration failures
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm ON public.profiles USING GIN (email gin_trgm_ops);';
  END IF;
END $$;
