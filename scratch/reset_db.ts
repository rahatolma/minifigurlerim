import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function reset() {
  console.log("Resetting series...");
  const { error: e1 } = await supabaseAdmin.from('series').update({ en_translation_status: 'missing' }).neq('en_translation_status', 'manual_override');
  if (e1) console.error(e1);
  else console.log("Series reset successful.");

  console.log("Clearing translation_jobs...");
  const { error: e2 } = await supabaseAdmin.from('translation_jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
  if (e2) console.error(e2);
  else console.log("Jobs cleared.");
}
reset();
