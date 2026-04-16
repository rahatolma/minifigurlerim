import 'server-only';
import { createClient } from '@supabase/supabase-js';

// NOT: Bu client sadece arka plan (Server Actions, Route Handlers, Cron vb.) süreçlerinde kullanılmalıdır.
// Asla client components tarafına geçirilmemelidir.
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL or Service Role Key is missing in environment variables.');
  }

  // createClient (supabase-js) ile backend özel client'i
  // auth: false -> Bu bağlantı user context persistance beklemez, db işlemleri doğrudan service_role yürür.
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}
