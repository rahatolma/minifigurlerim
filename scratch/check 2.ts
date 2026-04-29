import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function check() {
  const { data } = await supabaseAdmin.from('series').select('title, title_en, slug_tr, slug_en, en_translation_status').eq('en_translation_status', 'ready').limit(1);
  console.log(data);
}
check();
