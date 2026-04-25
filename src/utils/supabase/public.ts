import { createClient } from '@supabase/supabase-js';

import { validateSupabaseEnv } from '@/utils/env';

export const createPublicClient = () => {
  const { url, key } = validateSupabaseEnv();

  // Create standard supabase-js client with NO cookies or SSR auth logic
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });
};
