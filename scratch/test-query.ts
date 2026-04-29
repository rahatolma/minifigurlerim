import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function run() {
  const { data, error } = await supabase
    .from('series')
    .select('id, title, en_translation_status')
    .or('en_translation_status.in.(missing,failed),title_en.is.null,title_en.eq.""')
    .not('en_translation_status', 'in', '("manual_override","queued","generating","ready")')
    .limit(2);
    
  console.log("Error:", error);
  console.log("Data:", data);
}
run();
