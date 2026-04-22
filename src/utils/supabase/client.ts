import { createBrowserClient } from '@supabase/ssr';
import { SupabaseClient } from '@supabase/supabase-js';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL or Key missing in configuration. Environment variables must be provided.');
  }
  return createBrowserClient(supabaseUrl, supabaseKey);
};

export const supabase: SupabaseClient<any, "public", any> = new Proxy({} as any, {
  get: (target, prop) => {
    return (createClient() as any)[prop];
  }
});
