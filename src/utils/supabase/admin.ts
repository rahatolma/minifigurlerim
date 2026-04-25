import 'server-only';
import { createClient } from '@supabase/supabase-js';

import { validateSupabaseEnv } from '@/utils/env';

// NOT: Bu client sadece arka plan (Server Actions, Route Handlers, Cron vb.) süreçlerinde kullanılmalıdır.
// Asla client components tarafına geçirilmemelidir.
export function createAdminClient() {
  const { url } = validateSupabaseEnv();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error('Supabase Service Role Key is missing in environment variables.');
  }

  // createClient (supabase-js) ile backend özel client'i
  // auth: false -> Bu bağlantı user context persistance beklemez, db işlemleri doğrudan service_role yürür.
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}
