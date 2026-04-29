import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function check() {
  const { data } = await supabaseAdmin.from('series').select('id, title, title_en, en_translation_status, description_blocks_en');
  let missingBlocksCount = 0;
  for(let d of data || []) {
      if(!d.description_blocks_en) missingBlocksCount++;
  }
  console.log(`Total series: ${data?.length}`);
  console.log(`Missing blocks: ${missingBlocksCount}`);
}
check();
