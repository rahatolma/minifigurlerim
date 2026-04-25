import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

import { validateSupabaseEnv } from '@/utils/env';

export const createClient = () => {
  const { url, key } = validateSupabaseEnv();
  return createBrowserClient(url, key);
};

export const supabase: SupabaseClient<any, "public", any> = new Proxy({} as any, {
  get: (target, prop) => {
    return (createClient() as any)[prop];
  }
});
