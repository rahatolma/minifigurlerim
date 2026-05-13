-- ============================================================================================== --
-- SECURITY ADVISOR FIXES
-- ============================================================================================== --

-- 1. SECURITY DEFINER VIEW -> INVOKER
ALTER VIEW public.series_with_value_summary SET (security_invoker = true);

-- 2. DATA NORMALIZATION LOGS - RESTRICT INSERT
-- Risk: Mevcut policy herkesin log atmasına izin veriyor.
-- Çözüm: Zaten var olan `role = 'admin'` kontrolünü INSERT için ekliyoruz.
DROP POLICY IF EXISTS "Allow authenticated users to insert logs" ON public.data_normalization_logs;

CREATE POLICY "Allow authenticated users to insert logs" 
ON public.data_normalization_logs FOR INSERT TO authenticated WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
);

-- 3. REVOKE PUBLIC EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_privilege_escalation() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.sync_user_email() FROM PUBLIC;
-- Not: increment_page_view(text, uuid) public okuma istatistiği için bilerek açık bırakıldı.

-- 4. FUNCTION SEARCH PATH MUTABLE
ALTER FUNCTION public.calc_value_and_demand_scores() SET search_path = public;

-- 5. CONTACT MESSAGES
-- Policy "Public users can insert contact messages" bilerek bırakıldı. 
-- Zaten SELECT policy'si olmadığı için sadece yazma açıktır, veri okunamaz.

-- 6. STORAGE BUCKET
-- minifigure-images bucket'ı için herhangi bir değişiklik yapılmadı.
