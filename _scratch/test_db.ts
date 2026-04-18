import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data: settings, error: err1 } = await supabase.from('site_settings').select('*');
  console.log("Settings that might need migration:", settings?.filter(s => JSON.stringify(s.value).includes('/uploads/')));

  const { data: blocks, error: err2 } = await supabase.from('content_blocks').select('*');
  console.log("Content Blocks that might need migration:", blocks?.filter(b => JSON.stringify(b.content_json).includes('/uploads/')).length);
}
run();
