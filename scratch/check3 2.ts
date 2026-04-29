import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function check() {
  const { data } = await supabaseAdmin.from('translation_jobs').select('*');
  console.log(`Total jobs: ${data?.length}`);
  console.log(data?.slice(0, 5));
}
check();
