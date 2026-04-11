-- Düzeltme: Admin panelinden (Client Side) authenticated kullanıcıların kayıt/düzenleme yapabilmesi için yetkiler.
-- (Önceki rls_initplan optimizasyonunda bu tablolar tamamen service_role'a kilitlenmişti.)

CREATE POLICY "Enable insert for authenticated users" ON public.series FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.series FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.series FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.minifigures FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON public.minifigures FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete for authenticated users" ON public.minifigures FOR DELETE TO authenticated USING (true);
